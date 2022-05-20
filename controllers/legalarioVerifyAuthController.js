const logger = require('../utils/provident-originacion-apilogger/index');
const legalarioService = require('../utils/legalarioService')

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

exports.post_verify = async (req, res) => {
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2
    });

    try {
        console.log("Post a legalario");
        const serviceResult = await legalarioService.postAuthVerify(req.body);
        lambdaResponse.body = serviceResult;
        console.log("Termina post legalario");
    }
    catch(err) {
        lambdaResponse.statusCode = 500;
        lambdaResponse.errorMessage = err;
        console.log("Ocurrió un error interno al procesar la petición.", err);
    }

    return lambdaResponse;
}


