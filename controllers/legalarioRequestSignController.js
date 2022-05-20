const validationService = require('../utils/validator');
const axios = require('axios');
const FormData = require('form-data');
const qs = require('qs');

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
    console.log(req.body);
    const validationResult = validationService.validateEntryRequestSign(req.body);

    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;

        console.log("Error de validación: ", validationResult.validationMessage);
        return lambdaResponse;
    }
    console.log("Resultado de validación: ", validationResult);

    input.idDocument = Array.from(req.body.idDocument);
    input.fullname = req.body.fullname;
    input.phone = req.body.phone;
    input.email = req.body.email;
    input.idExpCliente = req.body.idExpCliente;
    input.focusId = req.body.focusId;
    input.fromSdk = req.body.fromSdk;

    try {
        console.log("Post a legalario");
        lambdaResponse.body = { auth: null };
        if (!req.body.authOnly) {
            const promiseArray = input.idDocument.map(id => postRequestSignature(id, input));
            const serviceResult = await Promise.all(promiseArray);
            lambdaResponse.body = {
                success: serviceResult[0].success,
                //concats all signers into one array
                signers: serviceResult.reduce((accum, el) => accum.concat(el.data.signers), [])
            }
        }
        if (!input.fromSdk) {
            console.log("Empieza request a request auth");
            lambdaResponse.body.auth = await postAuthRequest(input);
        }
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


const postRequestSignature = async (document_id, input) => {
    let data = new FormData();
    const token = input.fromSdk ? process.env.SDK_TOKEN : process.env.LEGALARIO_TOKEN;

    data.append('idDocument', document_id);
    data.append('workflow', 'true');
    data.append('signers', JSON.stringify({
        "fullname": input.fullname,
        "phone": input.phone,
        "email": input.email,
        "type": process.env.SIGNATURE_AREA_TAG
    }));

    console.log(data);

    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/agent/document/signers',
        data: data,
        headers: {
            ...data.getHeaders(),
            'Authorization': 'Bearer ' + token
        },
        metadata: {
            idExpCliente: input.idExpCliente,
            focusId: input.focusId,
            logRequest: {
                idDocument: document_id,
                workflow: true,
                signers: {
                    fullname: input.fullname,
                    phone: input.phone,
                    email: input.email,
                    type: process.env.SIGNATURE_AREA_TAG
                }
            }
        }
    };
    try {
        let response = await axios(config);
        console.log(response.data);
        console.log(response.data.data.signers);
        return response.data;
    }
    catch (err) {
        console.error(err);
        console.log(err?.response?.data);
        throw err?.response?.data || err;
    }
}

const postAuthRequest = async (input) => {
    const customer_login = input.phone;

    const postData = qs.stringify({
        'customer_login': customer_login, // document_id es plantilla
        'document_ids': input.idDocument
    });

    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/customer/auth/massive/request',
        data: postData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + process.env.LEGALARIO_TOKEN
        },
        metadata: {
            idExpCliente: input.idExpClient,
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