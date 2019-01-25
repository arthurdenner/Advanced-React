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
};

module.exports = mutations;
