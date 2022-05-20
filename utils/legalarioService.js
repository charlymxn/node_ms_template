
const axios = require('axios');
const qs = require('qs');

const postBiometrics = async (signer_id, input) => {
    console.log(input);

    let data = new FormData();
    data.append('signer_id', signer_id);
    data.append('profile', fs.createReadStream(input.profile));
    data.append('card', fs.createReadStream(input.card));

    var config = {
        method: 'post',
        url: process.env.LEGALARIO_API + '/api/customer/compare-faces',
        data: data,
        headers: {
            ...data.getHeaders(),
            'Authorization': 'Bearer ' + process.env.LEGALARIO_TOKEN
        },
        metadata: {
            idExpCliente: input.clientid,
            focusId: input.focusId,
            logRequest: {
                signer_id,
                profile: input.profile.split('-').pop(),
                card: input.card.split('-').pop()
            }
        }
    };
    try {
        let response = await axios(config);
        console.log(response.data);
        // response.data.success -> respuesta de legalario
        // response.data.data.success -> respuesta del servicio de comparacion
        if (response.data.data.success === false) {
            response.data.success = false;
            throw response.data;
        }

        return response.data;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}


const postRequestSignature = async (document_id, input) => {
    let data = new FormData();
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
            'Authorization': 'Bearer ' + process.env.LEGALARIO_TOKEN
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

const getDocumentBase64 = async (document_id, signed, input) => {
    const postData = qs.stringify({
        'document_id': document_id,
        'document_type': signed ? DOC_TYPE_SIGNED : DOC_TYPE_NOSIGN,
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
        return response.data;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}


module.exports = {
    postBiometrics,
    postAuthRequest,
    postRequestSignature,
    postAuthVerify,
    postDocumentFill,
    getDocumentBase64
};