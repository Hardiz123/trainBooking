import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // create a request handler to get all the data from the server
  const [seats, setSeats] = useState([]);
  const [seatsStatus, setSeatsStatus] = useState({ available: 0, reserved: 0 });
  const [numSeats, setNumSeats] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/seats").then((response) => {
      setSeats(response.data);
    });

    axios.get("http://localhost:3000/seatStatus").then((response) => {
      setSeatsStatus(response.data);
    }
    );

  }, []);


  const bookSeats = () => {
    if (numSeats > 7) {
      setMessage("You can book upto 7 seats at once");
      alert("You can book upto 7 seats at once");
      setNumSeats(0);
      return;
    }
    else {
      axios.post("http://localhost:3000/bookSeat", { count: numSeats }).then((response) => {
        // setSeats(response.data.seats);
        // setSeatsStatus(response.data.seatsStatus);
        setMessage(response.data);
        setNumSeats(0);
      }).then(() => {
        axios.get("http://localhost:3000/seats").then((response) => {
          setSeats(response.data);
        });
    
        axios.get("http://localhost:3000/seatStatus").then((response) => {
          setSeatsStatus(response.data);
        }
        );
      });
    }
  };

  const resetSeats = () => {
    axios.get("http://localhost:3000/resetSeats").then((response) => {
      setMessage(response.data);
      setNumSeats(0);
    }).then(() => {
      axios.get("http://localhost:3000/seats").then((response) => {
        setSeats(response.data);
      });
  
      axios.get("http://localhost:3000/seatStatus").then((response) => {
        setSeatsStatus(response.data);
      }
      );
    });
  }

  return (
    <div className="App">
      <div style={{marginLeft : "200px"}}>
        <div>
          <h2>Seats Status</h2>
          <div className="seatsStatus"> 
            <div className="availableSeats">Available Seats : {seatsStatus.available}</div>
            <div className="reservedSeats">Reserved Seats : {seatsStatus.reserved}</div>
          </div>
        </div>
        <div className="seatsContainer">
          {seats.map((seat) => {
            return (
              <div className={`seat ${seat.status}`} key={seat._id}>
                <div style={{}}>{seat.seatName}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{margin : '100px', alignItems:'self-start'}}>
        {/* label and input */}
        <label htmlFor="numSeats">Number of seats to Book : </label>
        <input
          type="number"
          id="numSeats"
          name="numSeats"
          value={numSeats}
          onChange={(e) => setNumSeats(e.target.value)}
        />
        <div style={{
          marginTop : '10px',
          fontSize : '14px',
          color : 'grey'
        }} >* You can book upto 7 seats at once</div>
        {message}

      <button className="bookButton" onClick={bookSeats} >Book Seats</button>
      <button className="bookButton" onClick={resetSeats} >Reset Seats</button>
      </div>
    </div>
  );
}

export default App;
