'use strict';
const AWS = require('aws-sdk');
const ses = new AWS.SES();

const sender = "wille_emanuel@hotmail.com";
const receiver = "wille.emanuel@gmail.com";

if (!AWS.config.region) {
  AWS.config.update({
    region: 'eu-west-1'
  });
}

// Converting String to Object
function QueryStringToObj(str) {
  let obj = {};
  str.replace(/([^=&]+)=([^&]*)/g, (m, key, value) => {
    obj[decodeURIComponent(key)] = decodeURIComponent(value).replace(/\+/g, ' ');
  });
  return obj;
}

module.exports.processFormData = (event, context, callback) => {

  // check if sent
  if(! event.body || event.body.trim() === '') {

    callback(null, {
      statusCode: 500,
      body: 'Die Daten wurden nicht gesendet!'
    });

    return;

  } else {

    event.body = QueryStringToObj(event.body);
  }

  // generate message
  const name = event.body.name.trim(),
        email = unescape(event.body.email.trim()),
        replyTo = event.body.name + " <" + email + ">",
        subject = "Kontaktformular - Email von: " + name,
        message = "Name: " + name + ">\n\n" + "E-Mail: " + email + ">\n\n" + "Nachricht: " + event.body.message.trim();

  // Sending email to predefined adress
  ses.sendEmail({
    Destination: {
      ToAddresses: [
        receiver
      ]
    },
    Message: {
      Body: {
        Text: {
          Data: message,
          Charset: 'UTF-8'
        }
      },
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      }
    },
    Source: sender,
    ReplyToAddresses: [
      replyTo
    ]
  }, (err, data) => {

    if (err) {
      console.log('Fehler:', JSON.stringify(err, null, 2));

      callback(null, {
        statusCode: 500,
        body: 'Die Nachricht konnte leider nicht versendet werden'
      });

    } else {

        callback(null, {
          statusCode: 200,
          body: 'Vielen Dank für deine Nachricht!'
        });

      }
    }
  )
}