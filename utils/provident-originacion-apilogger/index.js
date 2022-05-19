const aws = require('aws-sdk');
const lambda = new aws.Lambda();
const utils = require('./utils')
const axios = require('axios');

global.LOGGER_ALIAS;

/**
 * @param {object} args
 * @param {string} args.logStreamName - requerido, cloudwatch log id
 * @param {number} args.appId - id de la app que hace la peticion
 * @param {array} args.delPropsReq - property paths para borrar de la peticion
 * @param {array} args.delPropsRes - property paths para borrar de la respuesta
 */
const setupInterceptors = (args) => {
    // DO NOT set interceptor again
    if (global.LOGGER_ALIAS) return;

    // defaults as "Dev"
    global.LOGGER_ALIAS = process.env.SECRET_ALIAS == "Prod" ? "Prod" : "Dev";

    // request appends startTime
    axios.interceptors.request.use((request) => {
        if (!request.metadata) {
            request.metadata = {};
        }
        request.metadata.startTime = new Date();
        return request;
    });

    axios.interceptors.response.use(async (response) => {
        args.hasError = false;
        await writeLog(response.config, response, args);
        return response;
    },
    async (error) => {
        args.hasError = true;
        await writeLog(error.config, error.response, args);
        throw error;
    });
}

/**
 * Writes log
 * @param {*} request
 * @param {*} response
 * @param {*} args
 * @returns
 */
const writeLog = (request, response, args) => {
    // for duration
    const startTime = request.metadata.startTime;

    // deep copy response && request
    const res = response ? JSON.parse(JSON.stringify(response.data)) : null;
    const req = utils.parseRequest(request);

    for (let prop of args.delPropsReq || [])
        utils.deletePropertyPath(req, prop); // del from request

    for (let prop of args.delPropsRes || [])
        utils.deletePropertyPath(res, prop); // del from response

    const apiLog = {
        idExpedienteCliente_fk: request.metadata.idExpCliente,
        urlLog: request.url,
        httpMethod: request.method.toUpperCase(),
        requestBody: req ? JSON.stringify(req) : null,
        responseBody: res ? JSON.stringify(res) : null,
        responseStatusCode: res ? response.status : null,
        responseTime: new Date() - startTime,
        hasError: args.hasError,
        logStreamName: args.logStreamName,
        appId: request.metadata.appId || args.appId,
        focusId: request.metadata.focusId,
    }

    // lambda invoke params
    // InvocationType: 'Event' para no esperar respuesta,
    // aun asi hay que resolver el callback de que se hizo la peticion
    var params = {
        FunctionName: 'APILogger',
        InvocationType: 'Event',
        LogType: 'None',
        Payload: JSON.stringify(apiLog),
        Qualifier: global.LOGGER_ALIAS
    };

    // no lanzar errores para no confundir a axios / interceptor
    return new Promise((resolve, _reject) => {
        lambda.invoke(params, (err, res) => {
            console.log("ApiLogger:", res);
            if (err) {
                console.error("ApiLogger: Se produjo un error guardando los logs:\n", err);
            }
            resolve();
        });
    });
}

module.exports = {
    setupInterceptors
}
