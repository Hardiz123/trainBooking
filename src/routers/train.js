const express = require("express");
const trainRouter = express.Router();
const Seat = require("../modals/seats");

trainRouter.get("/seatStatus", async (req, res) => {
  const seatsStatus = { available: 0, reserved: 0 };

  const seats = await Seat.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  seats.forEach((seat) => {
    seatsStatus[seat._id] = seat.count;
  });

  res.send(seatsStatus);

  //
});

trainRouter.post("/bookSeat", async (req, res) => {
  let { count } = req.body;

  count = parseInt(count);
  // get seats from db and grop by row order by row and put count of available seats get seat id also
  const seats = await Seat.aggregate([
    { $match: { status: "available" } },
    {
      $group: {
        _id: "$row",
        count: { $sum: 1 },
        id: { $push: "$_id" },
      },
    },
    { $sort: { _id: 1, count: -1 } },
  ]);

  // book seats in row with max available seats and if not available then book in next row
  let seatsToBook = [];

  for (let i = 0; i < seats.length; i++) {
    if (seats[i].count >= count) {
      let seatsInRow = seats[i].id;
      let candidateSeats = [];
      for (let j = 0; j < seatsInRow.length; j++) {
        if (
          seatsInRow[j].seat % seatsInRow !== 0 &&
          (seatsInRow[j].seat + 1) % seatsInRow !== 1
        ) {
          candidateSeats.push(seatsInRow[j]);
        }
        if (candidateSeats.length === count) {
          seatsToBook = candidateSeats;
          break;
        }
      }
      if (seatsToBook.length > 0) {
        break;
      }
    }
  }

  // if seats are not available in same row then get other rows
  if (seatsToBook.length === 0) {
    let newSeats = [];
    for (let i = 0; i < seats.length; i++) {
      let seatsInRow = seats[i].id;
      if (count > newSeats.length) {
        newSeats = [...newSeats, ...seatsInRow];
      }
      if (newSeats.length > count) {
        while (newSeats.length !== count) {
          newSeats.pop();
        }
      }
      if (newSeats.length === count) {
        seatsToBook = newSeats;
        break;
      }
    }
  }
  if (seatsToBook?.length) {
    let seatIdsToBook = seatsToBook.map((seat) => seat);
    await Seat.updateMany(
      { _id: { $in: seatIdsToBook } },
      { $set: { status: "reserved" } }
    );

    // get seats booked row and seat number
    let seatsBooked = await Seat.find({ _id: { $in: seatIdsToBook } });

    let response = seatsBooked.map((seat) => {
      return seat.row + seat.seat;
    });
    res.send("Seats booked: " + JSON.stringify(response));
  } else {
    res.send("not enough seats to book");
  }
});

trainRouter.get("/resetSeats", async (req, res) => {
  // Delete all the seats
  await Seat.deleteMany({});

  // Insert the initial data for the coach
  for (let row = 1; row <= 12; row++) {
    for (let seat of ["A", "B", "C", "D", "E", "F", "G"]) {
      if (row === 12 && ["A", "B", "C"].indexOf(seat) < 0) {
        // Skip seats that do not exist in the last row
        continue;
      }
      await Seat.insertMany({ row: row, seat: seat, status: "available" });
    }
  }

  console.log("Inserted initial data for the coach");

  res.send("Reset Seats");
});

trainRouter.get("/seats", async (req, res) => {
  const seats = await Seat.find({});

  let newSeats = [];

  for (i = 0; i < seats.length; i++) {
    newSeats.push({
      seatName: seats[i].row + seats[i].seat,
      status: seats[i].status,
    });
  }
  res.send(newSeats);
});

module.exports = trainRouter;
