const AWS = require('aws-sdk');
var s3 = new AWS.S3();
const sharp = require('sharp');

const PATH = '//tmp//file';

const S3toTempFile = async (key) => {
    const filePath = PATH + '-' + key;

    var params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    };

    try {
        const data = await s3.getObject(params).promise();
        const img = sharp(data.Body, { failOnError: false });
        // imagenes de s3 tienen extension .png pero son jpeg,
        // se puede extraer el formato real de metadata
        const metadata = await img.metadata();
        await img.resize({
            height: 1200,
            width: 1200,
            fit: 'inside',
            withoutEnlargement: true // dont grow if size < 1200px
        }).withMetadata()
        .toFormat(metadata.format) // get original format from metadata
        .toFile(filePath);
    }
    catch(err) {
        console.error("S3 or sharp error: ");
        console.error(err);
        throw err;
    }

    return filePath;
}


const AWS = require('aws-sdk');
var s3 = new AWS.S3();

const fileExists = async (filename) => {
    var params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename
    };

    try {
        await s3.headObject(params).promise();
        return true;
    }
    catch(err) {
        return false;
    }
}

const S3UploadIfNotExists = async (event, file) => {
    const filename = event.idKiban + '_' + event.docType + '.pdf';
    if (await fileExists(filename)) {
        console.log("Ya hay un documento de nombre: " + filename);
        console.log("Retornando sin guardar")
        return ;
    }

    try {
        var params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
            Body: Buffer.from(file, 'base64')
        };

        await s3.putObject(params).promise();
        console.log("Se guardó el archivo: " + filename);
        return ;
    }
    catch (err) {
        console.log("ERROR GUARDANDO EN S3");
        console.err(err);
        throw err;
    }
}

const S3UpdateFile = async (event, file) => {
    const filename = event.idKiban + '_' + event.docType + '.pdf';
    try {
        var params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
            Body: Buffer.from(file, 'base64')
        };

        await s3.putObject(params).promise();
        console.log("Se guardó el archivo: " + filename);
        return ;
    }
    catch (err) {
        console.log("ERROR GUARDANDO EN S3");
        console.err(err);
        throw err;
    }
}


module.exports = {
    S3toTempFile,
    S3UploadIfNotExists,
    S3UpdateFile
}
