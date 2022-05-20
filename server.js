const express = require('express');
const cors = require('cors');
const app = express();
const {connectionPool} = require('./config/db');
//secrets
const secrets = require('./utils/secrets')
//route imports
const legalarioRoute = require('./routes/legalarioRoute');
const demoRoute = require('./routes/demoRoute');

// server port
const port =  process.env.PORT || 5000;
//secrets
//secrets.loadToEnv();

connectionPool();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//backend routing
app.use('/legalario', legalarioRoute);
app.use('/demo', demoRoute);

app.listen(port, () => console.log(`Server started on port ${port}`));