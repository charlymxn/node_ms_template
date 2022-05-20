const validationService = require('../utils/validator');
const legalario = require('../utils/legalarioService')

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

let input = {
    idDocument: null,
    fullname: null,
    phone: null,
    email: null,
    idExpCliente: null,
    focusId: null,
    fromSdk: null
}

exports.post_request_sign = async (req, res) => {
    const body = req.body;
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2,
        delPropsRes: [
            'data.userDocument',
            'data.signersSMS',
            'data.signersEmail'
        ]
    });

    console.log("Inicia validación.");
    console.log(body);
    const validationResult = validationService.validateEntryRequestSign(body);

    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        return lambdaResponse;
    }
    console.log("Resultado de validación: ", validationResult);

    input.idDocument = Array.from(body.idDocument);
    input.fullname = body.fullname;
    input.phone = body.phone;
    input.email = body.email;
    input.idExpCliente = body.idExpCliente;
    input.focusId = body.focusId;

    try {
        console.log("Post a legalario");
        lambdaResponse.body = { auth: null };
        if (!body.authOnly) {
            const promiseArray = input.idDocument.map(id => legalario.postRequestSignature(id, input));
            const serviceResult = await Promise.all(promiseArray);
            lambdaResponse.body = {
                success: serviceResult[0].success,
                //concats all signers into one array
                signers: serviceResult.reduce((accum, el) => accum.concat(el.data.signers), [])
            }
        }

        lambdaResponse.body.auth = await legalario.postAuthRequest(input);
        console.log("Termina post legalario");
    }
    catch (err) {
        lambdaResponse.body = null;
        lambdaResponse.statusCode = 500;
        lambdaResponse.errorMessage = err;
        console.log("Ocurrió un error interno al procesar la petición.", err);
    }

    return lambdaResponse;
};
