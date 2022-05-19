const qs = require('qs');
const FormData = require('form-data');

// deletes property with complex path eg 'data.payload.etc'
const deletePropertyPath = (obj, path) => {
    if (!obj) return;
    path = path.split('.');
    while (path.length > 1) {
        obj = obj[path.shift()];
        if (obj === undefined) return ;
    }
    delete obj[path.shift()];
};

const parseRequest = (axiosReq) => {
    const request = axiosReq.data || axiosReq.params;

    if (!request)
        return null;

    if ( (typeof request) == "string")
        return qs.parse(request);

    if (request instanceof FormData && axiosReq.metadata.logRequest)
        return axiosReq.metadata.logRequest;

    return JSON.parse(JSON.stringify(request));
}

module.exports = {
    deletePropertyPath,
    parseRequest
}
