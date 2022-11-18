const mongoose = require("mongoose");

module.exports = () => {
  const uri = process.env.MONGO_URI || "mongodb://0.0.0.0:27017/edWorld";
  mongoose
    .connect(uri)
    .then(() => {
      console.log(`Databse connected`);
    })
    .catch((err) => {
      console.log(`Database connection failed : ${err}`);
    });
};
