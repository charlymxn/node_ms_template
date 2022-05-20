const { connectionPool, sql } = require('../config/db');

exports.get_demo = async (req, res) => {
    console.log('get demo')
    try {
        const pool = await connectionPool();

        const dbResult = await pool.request()
            .input('Sucursal', sql.NVarChar(4), "2100")
            .execute('Get_Expedientes_Por_Registrar');
            console.log(dbResult)
        res.json(dbResult);
    } catch(error) {
        res.send(error);
    }  
}

exports.add_demo = async (req, res) => {
    try {
        res.status(200).send('All ok');
    }
    catch(error) {
        console.log(error);
    }
}


exports.delete_demo = async (req, res) => {
    console.log('Deleting leads');
    try {
       
        res.status(200).send("Success: all demos deleted");
    } catch(error) {
        res.send(error);
    }
    
}


exports.generate_demo = async (req, res) => {
    try {
       
        res.status(200).send("Success");
    } catch (error) {
        res.json(error);

    }
};