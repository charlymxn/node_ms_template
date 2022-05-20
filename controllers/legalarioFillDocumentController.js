const logger = require('../utils/provident-originacion-apilogger/index');
const validationService = require('../utils/validator');
const legalarioHelper = require('../utils/legalarioHelper');
const legalario = require('../utils/legalarioService')
const dbService = require('./dbService/fillDocumentService')

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

let input = {
    clientid: null,
    document: null,
    focusId: null
}

exports.post_filldocument = async (req, res) => {
    const body = body;

    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2,
        delPropsRes: [
            'data.userDocument.organization_document',
            'data.userDocument.sequence',
            'data.document',
            'data.userDocument.user'
        ]
    });

    console.log("Inicia validación.");
    console.log(body);
    const validationResult = validationService.validateEntryFillDocument(body);

    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        return lambdaResponse;
    }
    console.log("Resultado de validación: ", validationResult);

    input.clientid = body.clientid;
    input.focusId = body.focusId;
    const doc_type = Array.from(body.doc_type);
    try {
        console.log("Post a legalario");

        const dbResponse = await dbService.getExpedienteCliente(input);
        const client = dbResponse.data;

        const document_id = doc_type.map(type =>
            legalarioHelper.documentIdFromType(type, client)
        );

        let promises = document_id.map(id => legalario.postDocumentFill(id, client, input));
        const originalDocs = await Promise.all(promises);

        promises = originalDocs.map(doc =>
            legalario.getDocumentBase64(doc.data.userDocument._id, input)
        );
        const pdfs = await Promise.all(promises);

        lambdaResponse.body = {
            success: originalDocs[0].success,
            data: originalDocs.reduce((accum, el, idx) => {
                const returnData = {
                    _id: el.data.userDocument._id,
                    document: pdfs[idx].data.document
                }
                return accum.concat(returnData);
            }, []),
        };
        console.log("Retorna post legalario");
    }
    catch(err) {
        lambdaResponse.statusCode = 500;
        lambdaResponse.errorMessage = err.message;
        lambdaResponse.body = err;
        console.log("Ocurrió un error interno al procesar la petición.", err);
        console.log("error.blame: ", err.blame);
    }

    console.log("Termina proceso.");
    return lambdaResponse;
}


