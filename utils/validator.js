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


module.exports = {
    validateEntryFillDocument
};