# provident-originacion-apilogger
Interceptor de Axios para loggear automáticamente peticiones a APIs de terceros en aplicaciones Originacion.

El logger intercepta todas las respuestas a peticiones http de Axios y las envía a la cola de eventos del Lambda [ApiLogger](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/APILogger).

El logger puede fallar silenciosamente. Si no se están guardando los logs correctamente se puede revisar el [CloudWatch de APILogger](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252FAPILogger)

## Instalación en lambda
1) Seleccionar el lambda a loggear
2) Layers -> Add Layer
3) Custom Layers
4) `originacion-apilogger` última versión

La lambda loggeado debe tener el rol `lambda-role` para poder ejecutar el logger.

## Uso

Antes de hacer peticiones de axios se debe inicializar los interceptors del logger.
Se envia el `logStreamName` del contexto del lambda y `appId` referencia a la tabla de `AppClients` en la db `CognitoRoleAuthorizations`:
```javascript
const logger = require('provident-originacion-apilogger');
const axios = require('axios');

exports.handler = async (event, context) => {
    logger.setupInterceptors(axios, {
        logStreamName: context.logStreamName,
        appId: 1
    });
}
```
Para loggear `idExpCliente` o `focusId` junto con la petición se pueden agregar estos campos a la propiedad `metadata` en cada peticion de Axios.

```javascript
await axios({
    url: '...',
    method: '',
    data: {},
    metadata: {
        idExpCliente: event.idExpCliente,
        focusId: event.focusId,
        appId: 1 // opcional
    }
})
```

`metadata.appId` reemplaza el de `setupInterceptors`, útil para lambdas que se consumen desde multiples aplicaciones.

### FormData
En caso de que se envie FormData en la peticion, se tiene que agregar
`logRequest` a metadata para sustituir la petición en el log.
```javascript
const FormData = require('form-data');

var dataImagen = new FormData();
dataFront.append('categoria', 'ine_ife');
dataFront.append('imagen', FILE.Body, { filename: 'imagen123.jpeg' }); //imagen

await axios({
    url: '...',
    method: 'POST',
    data: dataImagen,
    metadata: {
        idExpCliente: event.idExpCliente,
        logRequest: {
            categoria: 'ine_ife',
            imagen: 'image123.jpeg'
        }
    }
})
```

### Eliminar objetos para el log
Para borrar propiedades largas (eg. imagen en base64) de peticiones o respuestas se utilizan los arreglos `delPropsRes` y `delPropsReq` en las opciones de `setupInterceptors`:
```javascript
logger.setupInterceptors(axios, {
    logStreamName: context.logStreamName,
    delPropsRes: ['address.geo', 'email'], // elimina email y address.geo de la respuesta en el log
    delPropsReq: ['data.property', 'data.image'] // elimina de la peticion
});
```


### Ejemplo completo:
```javascript
const logger = require('provident-originacion-apilogger');
const axios = require('axios');

exports.handler = async (event, context) => {
    logger.setupInterceptors(axios, {
        logStreamName: context.logStreamName,
        appId: 1,
        delPropsRes: ['address.geo', 'email'],
        delPropsReq: ['data.property', 'data.image']
    });

    const res = await axios({
        method: 'get',
        url: 'https://jsonplaceholder.typicode.com/users/2',
        metadata: {
            idExpCliente: event.idExpCliente,
            focusId: event.focusId,
            logRequest: {
               image: 'image.png',
               video: 'file.mp4',
               value: 'formdata',
               data: {
                   property: 'borrar',
                   image: 'borrar',
                   otro: 'no borrar'
                }
            }
        }
    });

    return res.data;
}
```
