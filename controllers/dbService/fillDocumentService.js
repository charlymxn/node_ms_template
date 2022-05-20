const { connectionPool, sql } = require('../../config/db');

const getExpedienteCliente = async (inputParams) => {
    let result = {
        data: null,
        errorCode: null,
        errorMessage: null
    };

    try {
        const pool = await connectionPool();

        const dbExpediente = await pool.request()
            .input('IdExpedienteCliente', sql.Int, inputParams.clientid)
            .execute('Get_Expediente_Fill_Document');

        console.log("Termina conexión a base de datos.");

        let arrayResponse, finalResponse;

        if (dbExpediente && dbExpediente.recordsets && dbExpediente.recordsets.length > 0) {
            // set first result matching id as body
            arrayResponse = dbExpediente.recordsets[0];
            finalResponse = lowercaseKeys(arrayResponse[0]);
            result.data = finalResponse;
        }
        console.log("Respuesta de base de datos exitosa.");
        return result;

    } catch (err) {
        console.error("Error en consulta de base de datos.");
        console.error(err);
        throw err;
    }
}

module.exports = {
    getExpedienteCliente
};
