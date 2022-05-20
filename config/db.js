const sql = require('mssql')
const env = require('dotenv').config(); 
const sqlConfig = {
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  server: process.env.RDS_HOSTNAME,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: process.env.ENV == 'dev' // change to true for local dev / self-signed certs
  }
}


let pool = null;

const connectionPool = async () => {
    if(pool){
      console.log("pool existente");
      return pool;
    }
    try {
        pool =  await sql.connect(sqlConfig);
        console.log("pool inicializado");
        return pool;
    } catch (error) {
        return error;
    }
}

module.exports = {
  connectionPool,
  sql
}