const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },
    seat: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "reserved"],
      default: "available",
    },
  },
);

const Seat = mongoose.model("Seats", seatSchema);

module.exports = Seat;
