const qs = require('qs');
const { DateTime } = require("luxon");
const writtenNumber = require('number-in-letters');
const DOCUMENT_ID = require('../config/config.json');
const { generateBarcodes } = require('./barcode');

// map getMonth to ES month
const MONTHS_ES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
]

const TIPO_PRODUCTO = {
    1: "homecredit",
    2: "negocio"
}

// indexar con client.plazo

const PLAZO_HC = {
    12: 0,
    32: 1,
    42: 2,
    52: 3,
    65: 4
}

const PLAZO_NEGOCIO = {
    32: 0,
    42: 1,
    52: 2,
    65: 3
}

const CAT_HC = {
    12: 1965.94, // 12 semanas
    32: 803.6,   // 32 semanas
    42: 495.4,   // 42
    52: 367.6,   // 52
    65: 251.4,   // 65
}

const CAT_NEGOCIO = {
    32: 488.9,   // 32 negocio
    42: 320.4,   // 42 negocio
    52: 237.5    // 52 negocio
}

// returns formatted currency string for given ammount
const numberToPesos = (ammount) => {
    const pesos = Math.trunc(ammount); // debe ser numero

    // toFixed para que .1 pase a 10/100 y no 1/100
    const cents = ammount.toFixed(2).split('.')[1];

    // NOTA: Errores de punto flotante de JS no te dejan hacer esto bien
    // const cents = Math.trunc((offer.cargoservicio - pesos) * 100);
    return writtenNumber(pesos, { lang: 'es' }) + " pesos "
        + cents + "/100 M.N.";
}

const toCurrency = (num) => {
    return '$ ' + num.toFixed(2);
}

/**
 * Nota:
 * Legalario pide url-form-encoded para esta ruta en particular,
 * aparentemente no se puede nada más usar qs.stringify(json) porque axios
 * no lo acepta, quiza por la misma complejidad del objeto (gracias legalario).
 * Asi que tuve que hacer ese hack usando backticks `` para que pueda pasar
 * el objeto bien con qs.
 * PD: no olviden las dobles comillas "" cuando interpolan variables.
 */
const documentPostData = async (document_id, client, branchInfo) => {
    let placeDateTime, cargoLetras, totalLetras, barcodeRes, montoEntregadoLetras;
    const today = new Date();
    console.log(client);
    // guarda oferta con o sin seguro
    // MONTO DEL PRESTAMO CON SEGURO = MONTOTOTALSEGURO - CARGOSERVICIOSEGURO
    // EN MONTO ENTREGADO AL CLIENTE MONTO CONFIRMADO client.monto
    let offer = {
        monto: null,
        montototal: null,
        cargoservicio: null,
        primerpagosemanal: null,
        pagosubsecuente: null
    };
    if (client.aceptacionseguro) {
        offer = {
            monto: client.montototalseguro - client.cargoservicioseguro,
            montototal: client.montototalseguro,
            cargoservicio: client.cargoservicioseguro,
            primerpagosemanal: client.primerpagosemanalseguro,
            pagosubsecuente: client.pagosubsecuenteseguro
        }
    }
    else {
        offer = {
            monto: client.monto,
            montototal: client.montototal,
            cargoservicio: client.cargoservicio,
            primerpagosemanal: client.primerpagosemanal,
            pagosubsecuente: client.pagosubsecuente
        }
    }

    let marketplacePrefix = client.idorigenofertaespecial == 1? 'mp-' : ''

    let prefix = process.env.SECRET_ALIAS + "-"
        + TIPO_PRODUCTO[client.idtipoproducto] + "-"
        + marketplacePrefix;

    placeDateTime = branchInfo.estado + ", "
        + branchInfo.ciudad + " "
        + DateTime.now().toFormat('dd/MM/yyyy');
    cargoLetras = numberToPesos(offer.cargoservicio);
    totalLetras = numberToPesos(offer.montototal);
    montoEntregadoLetras = numberToPesos(client.monto);

    // Ambiente Dev / Staging tiene Ids de documento diferentes
    const ENV_DOCS = DOCUMENT_ID[process.env.SECRET_ALIAS];
    
    console.log("Document ID",document_id);
    switch (document_id) {
        // TODO: domicilio cliente cambiar por direccion de la sucursal
        // ^ no sé si ya está hecho eso
        // pagare, negocio y home credit es lo mismo
        case ENV_DOCS.TEMPLATE_PAGARE:
            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-pagare",
                    "sequence": [
                        [{"key": 2, "value": "${offer.montototal.toFixed(2)}"}],
                        [{"key": 3, "value": "${client.nombrecliente}"}],
                        [{"key": 4, "value": "${branchInfo.direccion}"}],
                        [{"key": 6, "value": "${today.getDate()}"}],
                        [{"key": 7, "value": "${MONTHS_ES[today.getMonth()]}"}],
                        [{"key": 8, "value": "${today.getFullYear()}"}],
                        [{"key": 9, "value": "${branchInfo.ciudad}"}],
                        [{"key": 12, "value": "${branchInfo.estado}"}],
                        [{"key": 13, "value": "${client.diavencimiento}"}],
                        [{"key": 14, "value": "${client.mesvencimiento}"}],
                        [{"key": 15, "value": "${client.aniovencimiento}"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });
        case ENV_DOCS.SDK.TEMPLATE_PAGARE:
            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-pagare",
                    "sequence": [
                        [{"key": 2, "value": "${offer.montototal.toFixed(2)}"}],
                        [{"key": 3, "value": "${client.nombrecliente}"}],
                        [{"key": 4, "value": "${branchInfo.direccion}"}],
                        [{"key": 6, "value": "${today.getDate()}"}],
                        [{"key": 7, "value": "${MONTHS_ES[today.getMonth()]}"}],
                        [{"key": 8, "value": "${today.getFullYear()}"}],
                        [{"key": 9, "value": "${branchInfo.ciudad}"}],
                        [{"key": 12, "value": "${branchInfo.estado}"}],
                        [{"key": 13, "value": "${client.diavencimiento}"}],
                        [{"key": 14, "value": "${client.mesvencimiento}"}],
                        [{"key": 15, "value": "${client.aniovencimiento}"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });
        case ENV_DOCS.HOME_CREDIT.TEMPLATE_CONTRATO:
            // 5: traerlo de kiban o del json que esta arriba
            // 7: client.monto SIEMPRE, MONTO ENTREGADO AL CLIENTE
            // 9: comisiones, VACIO segun provident
            // 10: metodologia de calculo, VACIO segun provident
            // 12: select con valor client.plazo <- pre #199
            // 12: sacar de map PLAZO_ID para sacar el id del select en legalario
            // 17: contrato de adhesion, VACIO segun provident
            // 20: primeros 4 digitos de agencia
            // 25: cargo por servicio en letras (37 en NUMERO)
            // 26: MONTO CONFIRMADO
            // 27: branchInfo.estado, branchInfo.ciudad y fecha
            // opcional: 33, 34 y 35
            // 35: porcentaje asignado siempre 100% SI HAY SEGURO
            // 37 CARGO SERVICIO EN NUMERO

            // bloques
            // 1: seguro 0 = si, 1 = no
            // 16: mercadeo 0 = si, 1 = no
            // 31: Anticipado 0 = si, 1 = no SIEMPRE EN NO
            // 38: Decir verdad bla bla 0 = si, 1 = no SIEMPRE SI
            // 39: aceptacion de seguro: 0 = si, 1 = no

            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-contrato",
                    "sequence": [
                        [{"key": 1, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 2, "value": "${client.nombrecliente}"}],
                        [{"key": 3, "value": "${client.domiciliocliente}"}],
                        [{"key": 26, "value": ${offer.monto}}],
                        [{"key": 5, "value": "${CAT_HC[client.plazo]}"}],
                        [{"key": 7, "value": "${toCurrency(client.monto)}"}],
                        [{"key": 8, "value": "${toCurrency(offer.montototal)}"}],
                        [{"key": 9, "value": ""}],
                        [{"key": 10, "value": ""}],
                        [{"key": 12, "value": "${PLAZO_HC[client.plazo]}"}],
                        [{"key": 13, "value": "${toCurrency(offer.primerpagosemanal)}"}],
                        [{"key": 14, "value": "${toCurrency(offer.pagosubsecuente)}"}],
                        [{"key": 15, "value": "${client.diapago}"}],
                        [{"key": 16, "value": "${client.mercadeo ? 0 : 1}"}],
                        [{"key": 17, "value": ""}],
                        [{"key": 19, "value": "${client.foliocontrato}"}],
                        [{"key": 21, "value": "${client.agencia}"}],
                        [{"key": 22, "value": "${client.cliente}"}],
                        [{"key": 20, "value": "${client.agencia.substring(0, 4)}"}],
                        [{"key": 18, "value": "${client.numerocontrato}"}],
                        [{"key": 25, "value": "${cargoLetras}"}],
                        [{"key": 27, "value": "${placeDateTime}"}],
                        [{"key": 31, "value": "1"}],
                        [{"key": 33, "value": "${client.beneficiario}"}],
                        [{"key": 34, "value": "${client.parentesco}"}],
                        [{"key": 35, "value": "100%"}],
                        [{"key": 36, "value": "${totalLetras}"}],
                        [{"key": 37, "value": "${offer.cargoservicio.toFixed(2)}"}],
                        [{"key": 38, "value": "0"}],
                        [{"key": 39, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 40, "value": "${branchInfo.direccion}"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });
        case ENV_DOCS.SDK.TEMPLATE_CONTRATO:
            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-contrato",
                    "sequence": [
                        [{"key": 1, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 2, "value": "${client.nombrecliente}"}],
                        [{"key": 3, "value": "${client.domiciliocliente}"}],
                        [{"key": 4, "value": ${offer.monto}}],
                        [{"key": 5, "value": "${CAT_HC[client.plazo]}"}],
                        [{"key": 6, "value": "${client.monto.toFixed(2)}"}],
                        [{"key": 7, "value": "${offer.montototal.toFixed(2)}"}],
                        [{"key": 8, "value": "${totalLetras}"}],
                        [{"key": 9, "value": "${PLAZO_HC[client.plazo]}"}],
                        [{"key": 10, "value": "${offer.primerpagosemanal.toFixed(2)}"}],
                        [{"key": 11, "value": "${offer.pagosubsecuente.toFixed(2)}"}],
                        [{"key": 12, "value": "${client.diapago}"}],
                        [{"key": 13, "value": "${client.mercadeo ? 0 : 1}"}],
                        [{"key": 14, "value": "${client.numerocontrato}"}],
                        [{"key": 15, "value": "${client.foliocontrato}"}],
                        [{"key": 16, "value": "${client.agencia.substring(0, 4)}"}],
                        [{"key": 17, "value": "${client.agencia}"}],
                        [{"key": 18, "value": "${client.cliente}"}],
                        [{"key": 19, "value": "${cargoLetras}"}],
                        [{"key": 20, "value": "${offer.cargoservicio.toFixed(2)}"}],
                        [{"key": 21, "value": "${placeDateTime}"}],
                        [{"key": 22, "value": "${client.beneficiario}"}],
                        [{"key": 23, "value": "${client.parentesco}"}],
                        [{"key": 24, "value": "100%"}],
                        [{"key": 25, "value": "1"}],
                        [{"key": 26, "value": "${client.nombrecliente}"}],
                        [{"key": 27, "value": "${montoEntregadoLetras}"}],
                        [{"key": 28, "value": "1"}],
                        [{"key": 29, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 30, "value": "${client.monto.toFixed(2)}"}],
                        [{"key": 31, "value": "${branchInfo.direccion}"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });
            
        case ENV_DOCS.NEGOCIO.TEMPLATE_CONTRATO:
            barcodeRes = await generateBarcodes(branchInfo.idSucursal, client.numerocontrato);

            // Campos similares al contrato de arriba
            // ya incluyeron '$ __ M.N.' en todos los campos de dinero por lo cual no
            // se llama toCurrency
            // 4: direccion negocio
            // 5: numero telefono
            // 6: correo electronico
            // 7: offer.monto -> monto o monto+seguro
            // 8: monto entregado al cliente
            // 10: no estoy seguro si es igual que 7
            // 15: plazo - 1 porque aparentemente 0 = 32 <- pre #199
            // 15:
            // 30: pago anticipado, siempre es no = 0
            // 31: se quito, aceptacionseguro, igual que 1
            // 31: 2022-17-02 23:34 -> Ahora se usa desde que cambiaron los templates,
            // ahora se manda seguro 2 veces. Esto pudo haberse evitado, tristemente
            // no se evito y nunca se probó, y por eso estamos probando y corrigiendo
            // casi a las 12 am. Grax.
            // valores fijos de bancos porque si
            // 32: HSBC     clave       234
            // 33: HSBC     trans       5503
            // 34: HSBC     CIE         1398172
            // 36: BBVA     servicio    1412
            // 38: BANJIO   facturador  005012
            // 35, 37, 39: referencias de bancos - barcode sin checksum
            // 40: base64 banco
            // 41: base64 oxxo

            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-contrato",
                    "sequence": [
                        [{"key": 1, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 2, "value": "${client.nombrecliente}"}],
                        [{"key": 3, "value": "${client.domiciliocliente}"}],
                        [{"key": 4, "value": "${client.direccioncobranza}"}],
                        [{"key": 5, "value": "${client.celular}"}],
                        [{"key": 6, "value": "${client.correo || 'NA'}"}],
                        [{"key": 7, "value": "${offer.monto.toFixed(2)}"}],
                        [{"key": 8, "value": "${client.monto.toFixed(2)}"}],
                        [{"key": 9, "value": "${CAT_NEGOCIO[client.plazo]}"}],
                        [{"key": 10, "value": "${offer.montototal.toFixed(2)}"}],
                        [{"key": 11, "value": "50"}],
                        [{"key": 12, "value": "${totalLetras}"}],
                        [{"key": 13, "value": "${offer.primerpagosemanal.toFixed(2)}"}],
                        [{"key": 14, "value": "${offer.pagosubsecuente.toFixed(2)}"}],
                        [{"key": 15, "value": "${client.diapago}"}],
                        [{"key": 16, "value": "${PLAZO_NEGOCIO[client.plazo]}"}],
                        [{"key": 17, "value": "${client.mercadeo ? 0 : 1}"}],
                        [{"key": 18, "value": "${client.foliocontrato}"}],
                        [{"key": 19, "value": "${client.numerocontrato}"}],
                        [{"key": 20, "value": "${client.agencia.substring(0, 4)}"}],
                        [{"key": 21, "value": "${client.agencia}"}],
                        [{"key": 22, "value": "${client.cliente}"}],
                        [{"key": 23, "value": "${branchInfo.direccion}"}],
                        [{"key": 24, "value": "${cargoLetras}"}],
                        [{"key": 25, "value": "${offer.cargoservicio.toFixed(2)}"}],
                        [{"key": 26, "value": "${placeDateTime}"}],
                        [{"key": 27, "value": "${client.beneficiario}"}],
                        [{"key": 28, "value": "${client.parentesco}"}],
                        [{"key": 29, "value": "100%"}],
                        [{"key": 30, "value": "0"}],
                        [{"key": 31, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 32, "value": "234"}],
                        [{"key": 33, "value": "5503"}],
                        [{"key": 34, "value": "1398172"}],
                        [{"key": 35, "value": "${barcodeRes.referencia}"}],
                        [{"key": 36, "value": "1412"}],
                        [{"key": 37, "value": "${barcodeRes.referencia}"}],
                        [{"key": 38, "value": "005012"}],
                        [{"key": 39, "value": "${barcodeRes.referencia}"}],
                        [{"key": 40, "value": "${barcodeRes.bancoBase64}", "name": "IMAGEN_CLIENTE_HSBC"}],
                        [{"key": 41, "value": "${barcodeRes.oxxoBase64}", "name": "IMAGEN_CLIENTE_OXXO"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });

        case ENV_DOCS.HOME_CREDIT.TEMPLATE_MARKETPLACE:
            // 5: traerlo de kiban o del json que esta arriba
            // 7: client.monto SIEMPRE, MONTO ENTREGADO AL CLIENTE
            // 9: comisiones, VACIO segun provident
            // 10: metodologia de calculo, VACIO segun provident
            // 12: select con valor client.plazo <- pre #199
            // 12: sacar de map PLAZO_ID para sacar el id del select en legalario
            // 17: contrato de adhesion, VACIO segun provident
            // 20: primeros 4 digitos de agencia
            // 25: cargo por servicio en letras (37 en NUMERO)
            // 26: MONTO CONFIRMADO
            // 27: branchInfo.estado, branchInfo.ciudad y fecha
            // opcional: 33, 34 y 35
            // 35: porcentaje asignado siempre 100% SI HAY SEGURO
            // 37 CARGO SERVICIO EN NUMERO

            // bloques
            // 1: seguro 0 = si, 1 = no
            // 16: mercadeo 0 = si, 1 = no
            // 31: Anticipado 0 = si, 1 = no SIEMPRE EN NO
            // 38: Decir verdad bla bla 0 = si, 1 = no SIEMPRE SI
            // 39: aceptacion de seguro: 0 = si, 1 = no

            return qs.stringify({
                'document_id': document_id,
                'data': `{
                    "name": "${prefix + client.foliocontrato}-contrato",
                    "sequence": [
                        [{"key": 1, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 2, "value": "${client.nombrecliente}"}],
                        [{"key": 3, "value": "${client.domiciliocliente}"}],
                        [{"key": 4, "value": ${offer.monto}}],
                        [{"key": 5, "value": "${CAT_HC[client.plazo]}"}],
                        [{"key": 6, "value": "${client.monto.toFixed(2)}"}],
                        [{"key": 7, "value": "${offer.montototal.toFixed(2)}"}],
                        [{"key": 8, "value": "${totalLetras}"}],
                        [{"key": 9, "value": "${PLAZO_HC[client.plazo]}"}],
                        [{"key": 10, "value": "${offer.primerpagosemanal.toFixed(2)}"}],
                        [{"key": 11, "value": "${offer.pagosubsecuente.toFixed(2)}"}],
                        [{"key": 12, "value": "${client.diapago}"}],
                        [{"key": 13, "value": "${client.mercadeo ? 0 : 1}"}],
                        [{"key": 14, "value": "${client.numerocontrato}"}],
                        [{"key": 15, "value": "${client.foliocontrato}"}],
                        [{"key": 16, "value": "${client.agencia.substring(0, 4)}"}],
                        [{"key": 17, "value": "${client.agencia}"}],
                        [{"key": 18, "value": "${client.cliente}"}],
                        [{"key": 19, "value": "${cargoLetras}"}],
                        [{"key": 20, "value": "${offer.cargoservicio.toFixed(2)}"}],
                        [{"key": 21, "value": "${placeDateTime}"}],
                        [{"key": 22, "value": "${client.beneficiario}"}],
                        [{"key": 23, "value": "${client.parentesco}"}],
                        [{"key": 24, "value": "100%"}],
                        [{"key": 25, "value": "1"}],
                        [{"key": 26, "value": "${client.nombrecliente}"}],
                        [{"key": 27, "value": "${montoEntregadoLetras}"}],
                        [{"key": 28, "value": "1"}],
                        [{"key": 29, "value": "${client.aceptacionseguro ? 0 : 1}"}],
                        [{"key": 30, "value": "${client.monto.toFixed(2)}"}],
                        [{"key": 31, "value": "${branchInfo.direccion}"}]
                    ]
                }`.replace(/\n\s+/g,'')
            });
        default:
            throw Error(`no hay caso para document_id: ${document_id}.`);
    }
}

// Utils
// returns id corresponding to doc_type key
// idtipoproducto = 1 -> home credit
// idtipoproducto = 2 -> negocio
/**
 *
 * @param {string} doc_type
 * @param {any} client
 * @returns {String} Legalario document id
 */
const documentIdFromType = (doc_type, client) => {
    // Ambiente Dev / Staging tiene Ids de documento diferentes
    const ENV_DOCS = DOCUMENT_ID[process.env.SECRET_ALIAS];
    // Si es de marketplaceventasestrellas, usa los ids del sdk 
    if (client.idorigenofertaespecial == 2){
        if (doc_type == 'TEMPLATE_PAGARE')
            return ENV_DOCS.SDK.TEMPLATE_PAGARE;
        if (doc_type == 'TEMPLATE_CONTRATO')
            return ENV_DOCS.SDK.TEMPLATE_CONTRATO;
    }
    // pagare es igual para todos
    if (doc_type == 'TEMPLATE_PAGARE')
        return ENV_DOCS.TEMPLATE_PAGARE;
    else if (doc_type == 'TEMPLATE_CONTRATO') {
        // checar si es marketplace primero,
        // reemplazar doc_type a contrato marketplace
        if (client.idorigenofertaespecial == 1)
            doc_type = 'TEMPLATE_MARKETPLACE';

        // home credit
        if (client.idtipoproducto == 1)
            return ENV_DOCS.HOME_CREDIT[doc_type];
        // negocio
        else if (client.idtipoproducto == 2)
            return ENV_DOCS.NEGOCIO[doc_type];
    }

    throw Error("No se encontró documento " + doc_type +
                " para idexpedientecliente: " + client.idexpedientecliente +
                ", idtipoproducto: " + client.idtipoproducto +
                ", idorigenofertaespecial: " + client.idorigenofertaespecial);
}

module.exports = {
    documentPostData,
    documentIdFromType
};
