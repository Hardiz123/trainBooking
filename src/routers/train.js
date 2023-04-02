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
  const { count } = req.body;

  const seatsInRow = 7; // number of seats in a row
  const rowsInCoach = 12; // number of rows in the coach
  const seatsInLastRow = 3; // number of seats in the last row

  const bookSeats = async function (numSeats) {
    // Query the database for the number of available seats
    const availableSeatsCount = await Seat.countDocuments({
      status: "available",
    });

    // If there are not enough available seats, return an error message
    if (availableSeatsCount < numSeats) {
      return "Sorry, there are not enough seats available.";
    }

    // Find contiguous seats in a row
    let seatsToBook = [];
    for (let row = 1; row <= rowsInCoach; row++) {
      let seats = await Seat.find({ row: row, status: "available" })

      let candidateSeats = [];
      for (let i = 0; i < seats.length; i++) {
        if (
          seats[i].seat % seatsInRow !== 0 &&
          (seats[i].seat + 1) % seatsInRow !== 1
        ) {
          candidateSeats.push(seats[i]);
        } else {
          candidateSeats = [];
        }
        if (candidateSeats.length === numSeats) {
          seatsToBook = candidateSeats;
          break;
        }
      }
      if (seatsToBook.length > 0) {
        break;
      }
    }

    // If contiguous seats are not found, book nearby seats
    if (seatsToBook.length === 0) {
      for (let row = 1; row <= rowsInCoach; row++) {
        let seats = await Seat
          .find({ row: row, status: "available" })
        for (let i = 0; i < seats.length - numSeats + 1; i++) {
          if (i + numSeats > seats.length) {
            break;
          }
          seatsToBook = seats.slice(i, i + numSeats);
          break;
        }
        if (seatsToBook.length > 0) {
          break;
        }
      }
    }

    // Update the seats in the database
    let seatIdsToBook = seatsToBook.map((seat) => seat._id);
await Seat.updateMany(
  { _id: { $in: seatIdsToBook } },
  { $set: { status: "reserved" } }
);

// get seats booked row and seat number
let seatsBooked = await Seat.find({ _id: { $in: seatIdsToBook } });


let response = seatsBooked.map((seat) => {
  return  seat.row +  seat.seat;
});

return "Seats booked: " + JSON.stringify(response);




  };

  // Test the bookSeats function
  let result = await bookSeats(count);
  res.send(result);
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

  for (i =0 ;i< seats.length; i++){
    newSeats.push({seatName :  seats[i].row + seats[i].seat, status : seats[i].status})
  }
  res.send(newSeats);
});


module.exports = trainRouter;
