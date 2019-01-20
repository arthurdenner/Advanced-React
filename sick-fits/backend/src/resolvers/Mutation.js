const mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if the user is logged in

    return ctx.db.mutation.createItem({ data: { ...args } }, info);
  },
};

module.exports = mutations;
