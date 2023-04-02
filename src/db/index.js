var mongoose = require("mongoose");
const url = process.env.DB_URL || "mongodb://localhost:27017/train";
const connectionUrl = "mongodb+srv://admin-hardiz6996:hardik123@cluster0.lac9u.mongodb.net/?retryWrites=true&w=majority";

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
