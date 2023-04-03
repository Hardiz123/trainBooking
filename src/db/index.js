var mongoose = require("mongoose");
const url = process.env.DB_URL || "mongodb://localhost:27017/train";
const connectionUrl = url;

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
