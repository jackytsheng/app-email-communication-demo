// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
// Set the region
AWS.config.update({ region: 'us-east-1' });
const credentials = new AWS.SharedIniFileCredentials({ profile: 'email-demo' });
AWS.config.credentials = credentials;
// Create sendEmail params
const sendEmail = (message, callBack) => {
  const uuid = uuidv4();
  const params = {
    Destination: {
      /* required */
      ToAddresses: [
        'j.zheng822@gmail.com',
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: message + ' message Id:' + uuid,
        },
        Text: {
          Charset: 'UTF-8',
          Data: message + ' message Id:' + uuid,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Email Demo Message',
      },
    },
    Source: 'reply@jiajinzheng.com' /* required */,
    ReplyToAddresses: [
      'reply@jiajinzheng.com',
      /* more items */
    ],
  };

  const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
    .sendEmail(params)
    .promise();

  sendPromise
    .then(function (data) {
      console.log(data.MessageId);
      callBack();
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
};

module.exports = sendEmail;
