module.exports = {
  createShop(data) {
    return Shop.create(data);
  },

  getList(skip = 0, limit = 10) {
    let shopCount;
    return Shop.count()
      .then(count => {
        shopCount = count;
        return Shop.find({}).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: shopCount,
          list
        }
      });

  },

  getPins() {
    return Shop.find();
  }
};
