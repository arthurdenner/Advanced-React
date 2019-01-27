const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const setCookie = (ctx, userId) => {
  // 1. generate the JWT Token
  const token = jwt.sign({ userId }, process.env.APP_SECRET);
  // 2. Set the cookie with the token
  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
};

const mutations = {
  createItem(parent, args, ctx, info) {
    // TODO: Check if the user is logged in

    return ctx.db.mutation.createItem({ data: { ...args } }, info);
  },
  deleteItem(parent, args, ctx, info) {
    const { id } = args;

    return ctx.db.mutation.deleteItem({ where: { id } }, info);
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
};

module.exports = mutations;
