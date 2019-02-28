const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },
  async users(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      '{ permissions }'
    );

    hasPermission(user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }

    const user = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      '{ permissions }'
    );
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    const ownsOrder = order.user.id === ctx.request.userId;
    const isAdmin = user.permissions.includes('ADMIN');

    if (!ownsOrder && !isAdmin) {
      throw new Error("You can't see this order");
    }

    return order;
  },
};

module.exports = Query;
