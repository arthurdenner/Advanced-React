const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    return user;
  },
};

module.exports = mutations;
