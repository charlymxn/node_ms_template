const env = require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const app = express();

//route imports
const demoRoute = require('./routes/demoRoute');

// server port
const port =  process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//backend routing
app.use('/fillDocument', demoRoute);
app.use('/requestSing', demoRoute);

app.listen(port, () => console.log(`Server started on port ${port}`));