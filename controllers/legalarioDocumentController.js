const logger = require('../utils/provident-originacion-apilogger/index');
const awsService = require('../utils/awsService')
const legalario = require('../utils/legalarioService')
const validationService = require('../utils/validator');

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}


exports.get_document = async (req, res) => {
    const body = req.query;
    
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2,
        delPropsRes: [
            'data.document',
            'data.userDocument.sequence',
            'data.userDocument.user'
        ]
    });

    // input validation
    if (body.signed instanceof String)
        body.signed = body.signed === "true";

    const validationResult = validationService.validateEntryDocument(body);
    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        return lambdaResponse;
    }

    try {
        console.log("Post a legalario");
        const serviceResult = await legalario.getDocumentBase64(body.document_id, body.signed, body );

        if (body.signed && body.idKiban && body.docType) {
            if (body.updateDoc){
                await awsService.S3UpdateFile(body, serviceResult.data.document);
            }else{
                await awsService.S3UploadIfNotExists(body, serviceResult.data.document);
            }
        }

        lambdaResponse.body = serviceResult;
        console.log("Termina post legalario");
    }
    catch (err) {
        lambdaResponse.body = null;
        lambdaResponse.statusCode = 500;
        lambdaResponse.errorMessage = err;
        console.log("Ocurrió un error interno al procesar la petición.", err);
    }

    return lambdaResponse;
}