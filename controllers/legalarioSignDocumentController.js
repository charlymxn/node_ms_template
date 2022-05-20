// const { poolPromise } = require('./db');
// const logger = require('provident-originacion-apilogger');
const validationService = require('../utils/validator');

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

exports.post_signdocument = async (req, res) => {
    logger.setupInterceptors({
        logStreamName: context.logStreamName,
        appId: 2,
        delPropsRes: [
            'data.signer.document_hash',
            'data.signer.password_hash',
            'data.signer.signature_filepath',
            'data.signer.updated_at',
            'data.signer.created_at'
        ]
    });

    req.body.signer_id = Array.from(req.body.signer_id);
    const promiseArray = req.body.signer_id.map(id => legalario.postSignDocument(id, req.body));
    const serviceResult = await Promise.all(promiseArray);
    lambdaResponse.body = serviceResult;
    return lambdaResponse;
}
