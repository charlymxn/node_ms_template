const logger = require('../utils/provident-originacion-apilogger/index');
const validationService = require('../utils/validator');
const httpService = require('../utils/httpFolio');


let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}


exports.post_folio = async (req, res) => {
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2
    });

    let idFocusCliente = 0;
    let idFocusSucursal = 0;
    let idKiban = 0;
    let idOferta = 0;
    let proceso = "";

    let documentId = "";
    let documentType = "";

    let IdExpediente = 0;
    let AceptacionCaratula = false;
    let ProtestaVerdad = false;
    let Conformidad = false;
    let ConformidadPagare = false;

    console.log("Inicia validación.");

    const validationResult = validationService.validateEntryFolio(req.body);

    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);

        return lambdaResponse;
    }

    console.log("Resultado de validación: ", validationResult);

    if (req.body.Proceso == "FolioTesoreria") {
        try {
            console.log("Consulta a API Folio: ", req.body.idFocusCliente);
            const serviceResult = await httpService.GetFolio(req.body);

            if (serviceResult.errorMessage) {
                lambdaResponse.statusCode = 300;
                lambdaResponse.errorMessage = serviceResult.errorMessage;

                return lambdaResponse;
            }

            lambdaResponse.body = serviceResult.data;
            console.log("Termina Consulta a API Folio.");
        }
        catch (err) {
            lambdaResponse.statusCode = 500;
            lambdaResponse.errorMessage = err;
            console.log("Ocurrió un error interno al procesar la petición.", err);
        }
        console.log("Termina proceso.");

        return lambdaResponse;

    }
    else if (req.body.Proceso == "ObtenerDocumento") {
        documentId = req.body.documentid;
        documentType = req.body.documenttype;

        try {
            console.log("Obtener Documento Legalario: ", documentId);
            const serviceResult = await httpService.GetDocument(documentId, documentType);

            if (serviceResult.errorMessage) {
                lambdaResponse.statusCode = 300;
                lambdaResponse.errorMessage = serviceResult.errorMessage;

                return lambdaResponse;
            }

            lambdaResponse.body = serviceResult.data;
            console.log("Termina Consulta a API Folio.");
        }
        catch (err) {
            lambdaResponse.statusCode = 500;
            lambdaResponse.errorMessage = err;
            console.log("Ocurrió un error interno al procesar la petición.", err);
        }
        console.log("Termina proceso.");

        return lambdaResponse;

    }
    else if (req.body.Proceso == "Aceptacion") {
        IdExpediente = req.body.IdExpediente;
        AceptacionCaratula = req.body.AceptacionCaratula;
        ProtestaVerdad = req.body.ProtestaVerdad;
        Conformidad = req.body.Conformidad;
        ConformidadPagare = req.body.ConformidadPagare;

        try {
            console.log("Consulta a API Folio: ", IdExpediente);
            const serviceResult = await dbService.updtConsentimientos(IdExpediente, AceptacionCaratula, ProtestaVerdad, Conformidad, ConformidadPagare);

            if (serviceResult.errorMessage) {
                lambdaResponse.statusCode = 300;
                lambdaResponse.errorMessage = serviceResult.errorMessage;

                return lambdaResponse;
            }

            lambdaResponse.body = serviceResult.data;
            console.log("Termina Consulta a API Folio.");

            return lambdaResponse;
        }
        catch (err) {
            lambdaResponse.statusCode = 500;
            lambdaResponse.errorMessage = err;
            console.log("Ocurrió un error interno al procesar la petición.", err);
            return lambdaResponse;
        }
        console.log("Termina proceso.");

    }
    else if (req.body.Proceso == "FinProceso") {
        IdExpediente = req.body.IdExpediente;

        try {
            console.log("Fin de Proceso: ", IdExpediente);
            const serviceResult = await dbService.cierreOferta(IdExpediente);

            if (serviceResult.errorMessage) {
                lambdaResponse.statusCode = 300;
                lambdaResponse.errorMessage = serviceResult.errorMessage;

                return lambdaResponse;
            }

            lambdaResponse.body = serviceResult.data;
            console.log("Termina Consulta a API Folio.");

            return lambdaResponse;
        }
        catch (err) {
            lambdaResponse.statusCode = 500;
            lambdaResponse.errorMessage = err;
            console.log("Ocurrió un error interno al procesar la petición.", err);
            return lambdaResponse;
        }

    }
    return lambdaResponse;

}