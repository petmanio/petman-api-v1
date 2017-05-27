module.exports = {
  createBlog(data) {
    return Blog.create(data);
  },

  getList(skip = 0, limit = 10) {
    let total;
    return Blog.count()
      .then(count => {
        total = count;
        return Blog.find({}).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          total,
          list
        }
      });

  }
};
