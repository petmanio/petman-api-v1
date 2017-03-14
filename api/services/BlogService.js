module.exports = {
  createBlog(data) {
    return Blog.create(data);
  },

  getList(skip = 0, limit = 10) {
    return Blog.find({}).skip(skip).limit(limit);
  }
};
