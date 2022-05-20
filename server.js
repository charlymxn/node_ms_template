const express = require('express');
const cors = require('cors');
const app = express();
const {connectionPool} = require('./config/db')
//route imports
const legalarioRoute = require('./routes/legalarioRoute');

// server port
const port =  process.env.PORT || 5000;

connectionPool();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//backend routing
app.use('/legalario', legalarioRoute);

app.listen(port, () => console.log(`Server started on port ${port}`));