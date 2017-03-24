module.exports = {
  createBlog(data) {
    return Blog.create(data);
  },

  getList(skip = 0, limit = 10) {
    let blogCount;
    return Blog.count()
      .then(count => {
        blogCount = count;
        return Blog.find({}).skip(skip).limit(limit);
      })
      .then(list => {
        return {
          count: blogCount,
          list
        }
      });

  }
};
