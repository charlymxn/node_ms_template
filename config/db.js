const sql = require('mssql')
const env = require('dotenv').config(); 
const sqlConfig = {
  user: env.parsed.DB_USER,
  password: env.parsed.DB_PWD,
  database: env.parsed.DB_NAME,
  server: env.parsed.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: env.parsed.ENV == 'dev' // change to true for local dev / self-signed certs
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