const mutations = {
  createDog(parent, args, ctx, info) {
    global.dogs = global.dogs || [];
    global.dogs.push(args);

    return args;
  },
};

module.exports = mutations;
