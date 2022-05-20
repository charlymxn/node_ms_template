const logger = require('../utils/provident-originacion-apilogger/index');
const awsService = require('../utils/awsService')


const axios = require('axios');
const qs = require('qs');

const DOC_TYPE_NOSIGN = 'Documento sin firmas';
const DOC_TYPE_SIGNED = 'Documento con firmado';

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}


exports.get_document = async (req, res) => {
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
    if (req.body.signed instanceof String)
        req.body.signed = req.body.signed === "true";

    const validationResult = validationService.validateEntryDocument(req.body);
    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        return lambdaResponse;
    }

    try {
        console.log("Post a legalario");
        const serviceResult = await getDocumentBase64(req.body);

        if (req.body.signed && req.body.idKiban && req.body.docType) {
            if (req.body.updateDoc) {
                await awsService.S3UpdateFile(req.body, serviceResult.data.document);
            } else {
                await awsService.S3UploadIfNotExists(req.body, serviceResult.data.document);
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


const getDocumentBase64 = async (input) => {
    const postData = qs.stringify({
        'document_id': input.document_id,
        'document_type': input.signed? DOC_TYPE_SIGNED : DOC_TYPE_NOSIGN,
        'format': 'Base 64 (String Encoded)'
    });

    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/document/pdf/download',
        data: postData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.LEGALARIO_TOKEN
        },
        metadata: {
            idExpCliente: input.idExpCliente,
            focusId: input.focusId
        }
    };
    try {
        let response = await axios(config);
        // console.log(response.data.document); // document in base64
        return response.data;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
