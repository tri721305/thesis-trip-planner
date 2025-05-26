require('dotenv').config();

console.log('AWS Environment Variables Check:');
console.log('AWS_REGION:', process.env.AWS_REGION ? '✅ Set' : '❌ Not set');
console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? '✅ Set' : '❌ Not set');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set (value hidden)' : '❌ Not set');
