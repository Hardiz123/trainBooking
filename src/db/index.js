var mongoose = require("mongoose");
const connectionUrl = "mongodb://127.0.0.1:27017/train";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(connectionUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDatabase;
