const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: 'http://localhost:9000', // MinIO endpoint
    region: 'Eth-Addis_Ababa',         
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,     
        secretAccessKey: process.env.SECRET_ACCESS_KEY, 
    },
    forcePathStyle: true, // Required for MinIO
});

module.exports = s3;
