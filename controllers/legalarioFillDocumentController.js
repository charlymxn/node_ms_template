// const { poolPromise } = require('./db');
const logger = require('../utils/provident-originacion-apilogger/index');
const validationService = require('../utils/validator');
const legalarioHelper = require('../utils/legalarioHelper');

let lambdaResponse = {
    statusCode: 200,
    body: null,
    errorMessage: null
}

exports.post_filldocument = async (req, res) => {
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
    
    const validationResult = validationService.validateEntryFillDocument(req.body);
    if (!validationResult.isValid) {
        lambdaResponse.statusCode = 400;
        lambdaResponse.body = null;
        lambdaResponse.errorMessage = validationResult.validationMessage;    
    }

    input.clientid = req.body.clientid;
    input.focusId = req.body.focusId;
    input.fromSdk = req.body.fromSdk;


    const dbResponse = await dbService.getExpedienteCliente(input);
    const client = dbResponse.data;

    const document_id = doc_type.map(type =>
        legalarioHelper.documentIdFromType(type, client)
    );

    let promises = document_id.map(id => postDocumentFill(id, client, input));
    const originalDocs = await Promise.all(promises);
    
    let pdfs = [];
    if(!input.fromSdk){
        promises = originalDocs.map(doc =>
            getDocumentBase64(doc.data.userDocument._id, input)
        );
        pdfs = await Promise.all(promises);
    }

    lambdaResponse.body = {
        success: originalDocs[0].success,
        data: originalDocs.reduce((accum, el, idx) => {
            const returnData = {
                _id: el.data.userDocument._id,
                document: pdfs[idx]?.data.document
            }
            return accum.concat(returnData);
        }, []),
    };

    return lambdaResponse;
}



const postDocumentFill = async (document_id, client, input) => {
    try {
        const branch = client.agencia.substring(0, 4);
        const branchInfo = await httpService.getBranchInfo(branch, input);
        const authToken = input.fromSdk ? SDK_TOKEN : process.env.LEGALARIO_TOKEN;
        const postData = await legalarioHelper.documentPostData(document_id, client, branchInfo.sucursal);
        console.log(postData);

        var config = {
            method: 'post',
            url: process.env.LEGALARIO_API + '/api/document/fill',
            data: postData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + authToken
            },
            metadata: {
                idExpCliente: client.idexpedientecliente,
                focusId: input.focusId
            }
        };
        let response = await axios(config);
        // response.data only server response
        console.log(response.data);
        return response.data;
    }
    catch (err) {
        if (!err.blame) err.blame = "LEGALARIO";
        console.error(err);
        throw err;
    }
}


const getDocumentBase64 = async (document_id, input) => {
    const postData = qs.stringify({
        'document_id': document_id,
        'document_type': 'Documento sin firmas',
        'format': 'Base 64 (String Encoded)'
    });
    const authToken = input.fromSdk ? SDK_TOKEN : process.env.LEGALARIO_TOKEN;
    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/document/pdf/download',
        data: postData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + authToken
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