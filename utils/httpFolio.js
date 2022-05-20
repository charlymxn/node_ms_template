const dbService = require('../controllers/dbService');

const axios = require('axios');
const { request } = require('http');
const https = require('https');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
var qs = require('qs');
const axiosRetry = require('axios-retry');

let dbConfig = { };

const init = () => {
    //dbConfig = { bearer: process.env.Bearer };
    dbConfig = { bearer: process.env.LEGALARIO_TOKEN };
}

const GetDocument = async (documentId, documentType) =>
{
  console.log('Entró a getfolio');

    let result = {
        data: null,
        errorCode: null,
        errorMessage: null

    };

    try
    {
      init();

      var data = qs.stringify({
        'document_id': documentId,
        'document_type': documentType,
        'format': 'Base 64 (String Encoded)'
      });

      var config = {
        method: 'post',
        //url: 'https://www.sandbox-legalario.com/api/document/pdf/download',
        url: process.env.LEGALARIO_API,
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + dbConfig.bearer,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
      };

      let axiosreq = await axios(config);
      console.log("respuesta axios");
      result.data = axiosreq.data;
      console.log(axiosreq.data);

    }
    catch (err)
    {
      console.log(err);
      throw new Error(err);
  }

    return result;
}

const GetFolio = async (event) => {



  console.log('Entró a getfolio');
    
  axiosRetry(axios, {
      retries: 10, // number of retries
      retryDelay: (retryCount) => {
        console.log(`Retry attempt: ${retryCount}`);
        return retryCount * 1000; // time interval between retries
      },
      retryCondition: (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        return error.response.status === 500 || error.response.status === 501 || error.response.status === 502 || error.response.status === 503 || error.response.status === 404;
      },
    });

    let result = {
        data: null,
        errorCode: null,
        errorMessage: null
    };


    let folios = {
      folioContrato: null,
      numeroContrato: null,
      referenciaPago: null
    }

  try {
      var dataR = JSON.stringify({
        "idFocusCliente": event.idFocusCliente,
        "idFocusSucursal": event.idFocusSucursal,
        "tipoDePago": event.tipoDePago
      });

      var config = {
        method: 'post',
        url: process.env.PROVIDENT_URL + '/api/contrato/id-contrato' ,
        headers: {
          'Content-Type': 'application/json'
        },
        data : dataR,
        metadata: {
          idExpCliente: event.idExpCliente,
          focusId: event.focusId
        }
      };

      console.log('Entrar a axios');
      let axiosreq = await axios(config)
      .then(function (response) {
          //let jsResponse = JSON.stringify(response.data);
          result.data = response.data;

          console.log('result.data')
          console.log(result.data);


          if(result.data.ok)
          {
            //Envío a BD
            folios.folioContrato  = result.data.contrato.folioContrato;
            folios.numeroContrato = result.data.contrato.numeroContrato;
            folios.referenciaPago = result.data.contrato.referenciaPago;

            console.log(result.data.contrato.folioContrato);

          }
          else
          {
            result.errorCode = 301;
            result.errorMessage = "Error de Folio";
            return result
          }
      })
      .catch(function (error) {
        console.log('error');
        console.log(error.response.data);

        result.errorCode = 300;
        result.errorMessage = error.response.data.msg

        return result

      });

      if(folios.folioContrato == null || folios.numeroContrato == null || folios.referenciaPago == null)
      {

      }
      else
      {
      const serviceResult = await dbService.saveFolio(event.idkiban, event.idoferta, folios.folioContrato, folios.numeroContrato, folios.referenciaPago);
      if (serviceResult.errorMessage)
      {
          result.statusCode = 404;
          result.errorMessage = serviceResult.errorMessage;

          return result;
      }
    }

      return result;

  } catch (err) {
      console.log(err);
      throw new Error(err);
  }
}

module.exports = {
    GetFolio,
    GetDocument
};