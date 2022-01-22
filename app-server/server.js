const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const cors = require('cors');
const sendEmail = require('./aws-ses');
const fetch = require('node-fetch');

app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello World');
});

let messages = [{ sender: 'app', message: 'Hello can you reply again' }];

app.get('/messages', async function (req, res) {
  const response = await fetch(
    'https://reply-ses-email-demo.s3.amazonaws.com/message.json'
  );
  const data = await response.json();
  console.log(data);

  const { message } = data;

  const [messageExist] = messages.filter((m) => m.message === message);

  if (!messageExist) {
    messages.push({
      sender: 'client',
      message,
    });
  }

  res.send(messages);
});

app.post('/messages', jsonParser, function (req, res) {
  const { message } = req.body;
  const callBack = () => {
    messages.push({
      sender: 'app',
      message,
    });
    res.send(req.body);
  };
  sendEmail(message, callBack);
});

app.listen(8081, function () {
  console.log('Example app listening at http://localhost:8081');
});
