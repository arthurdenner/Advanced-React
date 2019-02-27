const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const checkLogin = ctx => {
  if (!ctx.request.userId) {
    throw new Error('You must be signed in to do that!');
  }
};

const setCookie = (ctx, userId) => {
  const token = jwt.sign({ userId }, process.env.APP_SECRET);

  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};

const mutations = {
  createItem(parent, args, ctx, info) {
    checkLogin(ctx);

    return ctx.db.mutation.createItem(
      {
        data: {
          ...args,
          user: { connect: { id: ctx.request.userId } },
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { where: { id: args.id } };
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      '{ id permissions }'
    );

    hasPermission(currentUser, ['ADMIN', 'ITEMDELETE']);

    const item = await ctx.db.query.item(where, '{ id user { id }}');
    const ownsItem = item.user.id === ctx.request.userId;

    if (!ownsItem) {
      throw new Error("You don't own this item");
    }

    return ctx.db.mutation.deleteItem(where, info);
  },
  updateItem(parent, args, ctx, info) {
    const { id, ...updates } = args;

    return ctx.db.mutation.updateItem({ data: updates, where: { id } }, info);
  },
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          email: args.email.toLowerCase(),
          permissions: { set: ['USER'] },
        },
      },
      info
    );

    setCookie(ctx, user.id);

    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid Password!');
    }

    setCookie(ctx, user.id);

    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');

    return { message: 'Goodbye!' };
  },
  async requestResetToken(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: email } });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const mailRes = await transport.sendMail({
      from: 'arthurdenner7@gmail.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });

    return { message: 'Thanks!' };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error("Your passwords don't match!");
    }

    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });

    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    setCookie(ctx, updatedUser.id);

    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    checkLogin(ctx);

    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: { permissions: { set: args.permissions } },
        where: { id: args.userId },
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    checkLogin(ctx);

    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: ctx.request.userId },
        item: { id: args.id },
      },
    });

    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }

    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: ctx.request.userId } },
          item: { connect: { id: args.id } },
        },
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    checkLogin(ctx);

    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{ id, user { id }}`
    );

    if (!cartItem) {
      throw new Error('No such cart item found');
    }

    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("You don't own this item");
    }

    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },
  async createOrder(parent, args, ctx, info) {
    checkLogin(ctx);

    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            title
            price
            id
            description
            image
            largeImage
          }
        }
      }`
    );
    const amount = currentUser.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });

    // Convert CartItems to OrderItems
    const orderItems = currentUser.cart.map(cartItem => {
      const { id, ...item } = cartItem.item;

      return {
        ...item,
        quantity: cartItem.quantity,
        user: { connect: { id: currentUser.id } },
      };
    });

    // Create an order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: currentUser.id } },
      },
    });

    // Remove user's cartItems
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: currentUser.cart.map(cartItem => cartItem.id),
      },
    });

    return order;
  },
};

module.exports = mutations;
