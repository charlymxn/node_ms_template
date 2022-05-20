const { connectionPool, sql } = require('../../config/db');

let result = {
    data: null,
    errorCode: null,
    errorMessage: null
};

const saveFolio = async (idkiban, idoferta, folioContrato, numeroContrato, referenciaPago) => {
    try {
        const pool = await connectionPool();

        const dbResult = await pool.request()
            .input('FolioContrato', sql.VarChar(11), folioContrato)
            .input('NumeroContrato', sql.VarChar(10), numeroContrato)
            .input('Referencia', sql.VarChar(16), referenciaPago)
            .input('IdKiban', sql.BigInt, idkiban)
            .input('IdOferta', sql.BigInt, idoferta)
            .input('IdPaso', sql.SmallInt, 101)
            .execute('usp_ExpedienteCliente_Update');

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
        if (err.number && err.number === 50002) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Agencia inexistente.';

            console.log("Error en consulta de base de datos: Agencia inexistente.");

            return result;
        }
        else if (err.number && err.number === 50010) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Teléfono inexistente.';

            console.log("Error en consulta de base de datos: Teléfono inexistente.");

            return result;
        }
        else {
            console.log("Error en consulta de base de datos.");

            throw err;
        }
    }
}

const updtConsentimientos = async (IdExpediente, AceptacionCaratula, ProtestaVerdad, Conformidad, ConformidadPagare) => {
    let result = {
        data: null,
        errorCode: null,
        errorMessage: null
    };

    try {
        const pool = await connectionPool();

        const dbResult = await pool.request()
            .input('IdExpediente', sql.Int, IdExpediente)
            .input('AceptacionCaratula', sql.Bit, AceptacionCaratula)
            .input('ProtestaVerdad', sql.Bit, ProtestaVerdad)
            .input('Conformidad', sql.Bit, Conformidad)
            .input('ConformidadPagare', sql.Bit, ConformidadPagare)
            .execute('usp_ExpedienteConsentimientoLegalario_Insert');

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
        if (err.number && err.number === 50002) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Agencia inexistente.';

            console.log("Error en consulta de base de datos: Agencia inexistente.");

            return result;
        }
        else if (err.number && err.number === 50010) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Teléfono inexistente.';

            console.log("Error en consulta de base de datos: Teléfono inexistente.");

            return result;
        }
        else {
            console.log("Error en consulta de base de datos.");

            throw err;
        }
    }
}

// TO DO PASO 30 ESTA AQUI
const cierreOferta = async (IdExpediente) => {
    let result = {
        data: null,
        errorCode: null,
        errorMessage: null
    };

    try {
        console.log("Inicia conexión a base de datos.");

        const pool = await connectionPool();

        const dbResult = await pool.request()
            .input('IdExpediente', sql.Int, IdExpediente)
            .execute('usp_Cierre_Oferta');

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
        if (err.number && err.number === 50002) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Agencia inexistente.';

            console.log("Error en consulta de base de datos: Agencia inexistente.");

            return result;
        }
        else if (err.number && err.number === 50010) {
            result.errorCode = err.number;
            result.errorMessage = err.message ? err.message : 'Teléfono inexistente.';

            console.log("Error en consulta de base de datos: Teléfono inexistente.");

            return result;
        }
        else {
            console.log("Error en consulta de base de datos.");

            throw err;
        }
    }
}

module.exports = {
    saveFolio,
    updtConsentimientos,
    cierreOferta
};
