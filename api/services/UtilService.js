module.exports = {
  uploadFile(req, fieldName, dirName) {
    return new Promise((resolve, reject) => {
      req.file(fieldName).upload({
        dirname: dirName
      }, (error, uploadedFiles) => {
        if (error) {
          return reject(error);
        }
        resolve(uploadedFiles);
      });
    });
  },

  messageQueryAsync(query) {
    return new Promise((resolve, reject) => {
      Message.query(query, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }
};
