const BASE_BANCARIO = "2121212121212".split("").map(a => parseInt(a));
const BASE_OXXO = "1212121212121212".split("").map(a => parseInt(a));

/**
 * Generate reference numbers and barcodes
 * @param {string} idsucursal
 * @param {string} numeroContrato
 * @returns {Promise<{
 * referencia: string,
 * bancoBase64: string,
 * oxxoBase64: string
 * }>}
 */
const generateBarcodes = async (idsucursal, numeroContrato) => {
    // codigo base segun spec
    let codigoBanco = idsucursal + "" + numeroContrato;
    // hacer checksum y agregar digito
    codigoBanco = codigoBanco + checksumCode(codigoBanco, BASE_BANCARIO);

    let codigoOxxo = "21" + codigoBanco; // prefix 21 al codigo bancario c/checksum
    codigoOxxo = codigoOxxo + checksumCode(codigoOxxo, BASE_OXXO);

    try {
        const responses = await Promise.all([
            generateBarcodeImg(codigoBanco, 'code39'),
            generateBarcodeImg(codigoOxxo, 'code128')
        ]);

        return {
            referencia: codigoBanco,
            bancoBase64: responses[0],
            oxxoBase64: responses[1]
        }
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

const checksumCode = (code, base) => {
    let codigoSplit = code.split("").map(a => parseInt(a));
    let checksum = 0;
    for (let i = 0; i < codigoSplit.length; i++) {
        let n = codigoSplit[i] * base[i];
        // si es mayor
        if (n >= 10) {
            const arr = n.toString().split('');
            n = parseInt(arr[0]) + parseInt(arr[1]);
        }

        checksum += n;
    }

    return (10 - checksum % 10) % 10;
}

const generateBarcodeImg = (code, provider) => {
    var params = {
        FunctionName: 'generateBarcode', // the lambda function we are going to invoke
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify({ code, provider })
    };
    return new Promise((resolve, reject) => {
        lambda.invoke(params, (err, res) => {
            const data = JSON.parse(res.Payload); // lambda payload is string
            if (err) {
                reject(err);
            }
            else if (data.statusCode === 400) {
                console.error(data);
                reject(new Error("Error creando codigo de barras:\n" + res.Payload));
            } else {
                resolve(data.body);
            }
        });
    });
}

module.exports = {
    generateBarcodes
}
