
const logger = require('../utils/provident-originacion-apilogger/index');
const validationService = require('../utils/validator');
const awsService = require('../utils/awsService')
const legalario = require('../utils/legalarioService')


let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

let input = {
    clientid: null,
    signer_id: null,
    focusId: null
}
exports.biometrics = async (req, res) => {
    const body = req.body;
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2
    });

    const validationResult = validationService.validateEntryBiometrics(body);

    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        throw lambdaResponse;
    }
    console.log("Resultado de validación: ", validationResult);

    input.clientid = body.clientid;
    input.focusId = body.focusId;
    input.signer_id = Array.from(body.signer_id);

    try {
        console.log("trayendo de DB");
        const documents = await dbService.getExpedienteDocs(input);

        let filenamePromises = [];
        // tipo 1 y nombre INEF
        // get filename of doc type 1 from stored S3 url
        const inefURL = documents.data.find( (doc) =>
            doc.idtipodocumento == 1 && doc.enlacedocumento.includes("INEF")
        );

        if (!inefURL)
            throw new Error(`cliente ${input.clientid} no tiene doc INEF`);

        const inef = inefURL.enlacedocumento.split('/').pop();
        filenamePromises.push(awsService.S3toTempFile(inef));

        // 5 = prueba de vida video
        // 4 = prueba de vida foto - no se si se guarda
        const pruebadevidaURL = documents.data.find( (doc) =>
            doc.idtipodocumento == 4
        );

        if (!pruebadevidaURL)
            throw new Error(`cliente ${input.clientid} no tiene doc foto pruebadevida`);

        const pruebadevida = pruebadevidaURL.enlacedocumento.split('/').pop();
        filenamePromises.push(awsService.S3toTempFile(pruebadevida));

        // save file paths
        console.log("Trayendo archivos de S3");
        const filenames = await Promise.all(filenamePromises);
        input.card = filenames[0];
        input.profile = filenames[1];

        console.log("Post a Legalario");
        const promiseArray = body.signer_id.map(id => legalario.postBiometrics(id, input));
        const serviceResult = await Promise.all(promiseArray);
        lambdaResponse.body = serviceResult;
    }
    catch(err) {
        lambdaResponse.body = null;
        lambdaResponse.statusCode = 500;
        lambdaResponse.body = err.stack;
        lambdaResponse.errorMessage = err.message;
        console.log("Ocurrió un error interno al procesar la petición.", err);
    }
    return lambdaResponse;
}



