const { connectionPool, sql } = require('../../config/db');

const getExpedienteDocs = async(inputParams) => {
    let result = {
        data: null,
        errorCode: null,
        errorMessage: null
    };

    try {
        const pool = await connectionPool();

        const dbResult = await pool.request()
                .input('IdExpedienteCliente', sql.Int, inputParams.clientid)
                .execute('Get_Expediente_Docs');

        console.log("Termina conexión a base de datos.");

        if (dbResult && dbResult.recordsets && dbResult.recordsets.length > 0) {
            const spResult = dbResult.recordsets[0];
            const fnResult = spResult.map(r => {
                return lowercaseKeys(r);
            })
            result.data = fnResult;
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
    getExpedienteDocs
};