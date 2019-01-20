const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  // items(parent, args, ctx) {
  //   return ctx.db.query.items();
  // }
};

module.exports = Query;
