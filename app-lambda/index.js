const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const HTMLParser = require('node-html-parser');
const bucketName = '<REPLACE THIS>';
const savedBucketName = '<REPLACE THIS>';

// directly send to this email will break it
exports.handler = (event) => {
  console.log('Processing email now');
  console.log(JSON.stringify(event));
  const sesNotification = event.Records[0].ses;
  const email = sesNotification.mail.source;
  const timestamp = sesNotification.mail.timestamp;
  console.log('SES Notification:\n', JSON.stringify(sesNotification, null, 2));
  const headers = sesNotification.mail.headers;

  // original value has string like this "multipart/alternative; boundary=\"000000000000e8071905cc016a9c\""
  const value = headers.filter((header) => header.name === 'Content-Type')[0]
    .value;

  // eg: --000000000000e8071905cc016a9c
  const boundaryID = '--' + value.split('boundary=')[1].split('"')[1];

  // Retrieve the email from your bucket
  s3.getObject(
    {
      Bucket: bucketName,
      Key: sesNotification.mail.messageId,
    },
    (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('Raw email:\n' + data.Body);
        const json = parseResultToJSON(data.Body, boundaryID, email, timestamp);
        console.log(JSON.stringify(json));

        // Putting Object to the Public Bucket as a work around
        s3.putObject(
          {
            Bucket: savedBucketName,
            Key: 'message.json',
            Body: JSON.stringify(json),
          },
          (err, data) => {
            if (err) {
              console.log(err, err.stack);
            } else {
              console.log(data);
            }
          }
        );
      }
    }
  );
};

const parseResultToJSON = (textBody, boundaryID, email, timestamp) => {
  //extract the thread ID
  const emailFragments = textBody.toString('utf8').split(boundaryID);
  let emailBodyPlain = emailFragments[1];
  console.log(emailBodyPlain);

  //extract the newest message
  let emailBodyHtml = emailFragments[2];

  emailBodyHtml = prettifier(emailBodyHtml);

  let replyHTML = emailBodyHtml
    .split('<div class=3D"gmail_quote">')[0]
    .split('Content-Transfer-Encoding: quoted-printable')[1];

  const root = HTMLParser.parse(replyHTML);

  const message = root.textContent;

  console.log('Reply Body :', message);

  return { message, email, timestamp };
};

const prettifier = (text) => {
  let result = text;

  // Delete the =\r\n text
  result = result.replace(/=?(?:\\[rn]|[\r\n]+)+/g, '');

  // Delete the windows space chareacter
  result = result.replace(/=[Cc]2=[Aa]0/g, ' ');

  // Delete Tabs & Spaces
  return result.replace(/\s\s+/g, ' ');
};
