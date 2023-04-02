// make node and express server
const express = require('express');
let  connectToDatabase =  require("./src/db/index.js");
const trainRouter = require('./src/routers/train.js');
const app = express();
const port = process.env.PORT || 3000;
connectToDatabase();


// add cors
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(trainRouter);


// start express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    }
);

