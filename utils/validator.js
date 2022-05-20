const validateEntryFillDocument = (event) => {
    console.log('event', event)
    let validationResult = {
        isValid: true,
        validationMessage: ''
    };

    if (!event) {
        validationResult.isValid = false;
    }

    if (!event.clientid || isNaN(event.clientid)) {
        console.log(typeof event.clientid);
        validationResult.isValid = false;
        validationResult.validationMessage += "clientid invalido.";
    }

    if (!event.doc_type || event.doc_type.toString().trim() === "") {
        console.log(typeof event.document_id);
        validationResult.isValid = false;
        validationResult.validationMessage += "doc_type invalido.";
    }

    return validationResult;
}



const validateEntryFolio = (event) => {
    let validationResult = {
        isValid: false,
        validationMessage: 'Petición inválida.'
    };



    if (!event.Proceso || event.Proceso.toString().trim() === "") 
    {
        return validationResult;
    }
    if (event.Proceso == "FolioTesoreria")
    {
        if (!event.idFocusCliente || event.idFocusCliente.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.idFocusSucursal || event.idFocusSucursal.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.idkiban || event.idkiban.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.idoferta || event.idoferta.toString().trim() === "") 
        {
            return validationResult;
        }
    }
    if (event.Proceso == "ObtenerDocumento")
    {
        if (!event.documentid || event.documentid.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.documenttype || event.documenttype.toString().trim() === "") 
        {
            return validationResult;
        }
    }
    if (event.Proceso == "Aceptacion")
    {
        if (!event.IdExpediente || event.IdExpediente.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.AceptacionCaratula || event.AceptacionCaratula.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.ProtestaVerdad || event.ProtestaVerdad.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.Conformidad || event.Conformidad.toString().trim() === "") 
        {
            return validationResult;
        }
        else if (!event.ConformidadPagare || event.ConformidadPagare.toString().trim() === "") 
        {
            return validationResult;
        }
    }
    if (event.Proceso == "FinProceso"){
        if (!event.IdExpediente || event.IdExpediente.toString().trim() === "") 
        {
            return validationResult;
        }
    }

    validationResult.isValid = true;
    validationResult.validationMessage = "Validación exitosa.";
    return validationResult;
}


const validateEntryRequestSign = (event) => {
    let validationResult = {
        isValid: true,
        validationMessage: ''
    };

    if (!event) {
        validationResult.isValid = false;
        return validationResult;
    }

    if (event.authOnly && event.phone)
        return validationResult;

    // checa arrays tambien
    if (!event.idDocument || event.idDocument.toString().trim() === "") {
        validationResult.isValid = false;
        validationResult.validationMessage += "idDocument invalido.";
    }

    if (!event.fullname || event.fullname.toString().trim() === "") {
        validationResult.isValid = false;
        validationResult.validationMessage += "fullname invalido.";
    }

    if (!event.phone || event.phone.toString().trim() === "") {
        validationResult.isValid = false;
        validationResult.validationMessage += "email o phone invalido.";
    }

    return validationResult;
}

const validateEntryBiometrics = (event) => {
    let validationResult = {
        isValid: false,
        validationMessage: 'Petición inválida.'
    };

    if (!event) {
        return validationResult;
    }
    if (!event.clientid || event.clientid.toString().trim() === "") {
        return validationResult;
    }
    if (!event.signer_id || event.signer_id.toString().trim() === "") {
        return validationResult;
    }

    validationResult.isValid = true;
    validationResult.validationMessage = "Validación exitosa.";
    return validationResult;
}


const validateEntryDocument = (event) => {
    let validationResult = {
        isValid: true,
        validationMessage: ''
    };

    if (!event) {
        validationResult.isValid = false;
    }
    if (!event.document_id || event.document_id.toString().trim() === "") {
        console.log(typeof event.clientid);
        validationResult.isValid = false;
        validationResult.validationMessage += " document_id invalido.";
    }
    // boolean validation
    if (event.signed == null || event.signed == undefined) {
        validationResult.isValid = false;
        validationResult.validationMessage += " signed invalido.";
    }

    if (event.signed && !event.idKiban) {
        validationResult.isValid = false;
        validationResult.validationMessage += " falta idKiban para guardar documento firmado";
    }

    if (event.docType && !(event.docType == 'Contrato' || event.docType == 'Pagare')) {
        validationResult.isValid = false;
        validationResult.validationMessage += " docType valido es 'Contrato' o 'Pagare'";
    }

    return validationResult;
}

module.exports = {
    validateEntryFillDocument,
    validateEntryFolio,
    validateEntryRequestSign,
    validateEntryBiometrics,
    validateEntryDocument
};