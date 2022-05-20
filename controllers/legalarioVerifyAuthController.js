const logger = require('../utils/provident-originacion-apilogger/index');

const axios = require('axios');
const qs = require('qs');

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
        const serviceResult = await postAuthVerify(req.body);
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


const postAuthVerify = async (input) => {
    const postData = qs.stringify({
        'customer_login': input.customer_login,
        'code': input.code,
        'document_ids': Array.from(input.document_id)
    });

    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/customer/auth/massive/verify',
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
        console.log(response.data);
        return response.data;
    }
    catch (err) {
        console.error(err);
        console.log(err?.response?.data);
        throw err?.response?.data || err;
    }

}