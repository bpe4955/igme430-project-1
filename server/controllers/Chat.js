//const { contentSecurityPolicy } = require('helmet');
//const models = require('../models');

// Server Storage
//const users = {};
const messages = {};
const requests = {}; // For Long-Polling
let requestsLength = 0;
let lastRequest = 0;

const chatPage = async (req, res) => res.render('app');

const getMessages = (req, res) => {
    const requestTime = Date.now();
    let clientTime;
    if (req.params.time) { clientTime = req.params.time; } else { clientTime = 0; }
    // const clientTime = params.time;
    const messagesToSend = {};
    Object.keys(messages).forEach((key) => {
        if (key > clientTime) { messagesToSend[key] = messages[key]; }
    });
    // If no messages to send, send success
    if (Object.keys(messagesToSend).length === 0) {
        return res.status(200).json({time: requestTime});
    }
    const responseJSON = { messages: messagesToSend, time: requestTime };
    return res.status(200).json(responseJSON);
};

// Called once a message is posted
// Handles all long poll requests for messages
const handleStoredRequests = () => {
    for (let index = lastRequest; index < requestsLength; index++) {
      getMessages(
        requests[index].request,
        requests[index].response,
        requests[index].params,
        requests[index].head,
      );
    }
    lastRequest = requestsLength;
  };

// function to add a message from a POST body
const sendMessage = (req, res) => {
    // default json message
    const responseJSON = {
        message: 'Name, Color, and Message are required.',
    };

    // If the post request is empty
    if (!req.body) {
        responseJSON.message = 'No body sent with POST request';
        responseJSON.id = 'noBodySent';
        return res.status(501).json(responseJSON);
    }

    // If something is missing, send back an error message as a 400 badRequest
    if (!req.body.name || !req.body.color || !req.body.message) {
        responseJSON.id = 'missingParams';
        return res.status(400).json(responseJSON);
    }

    // add fields for this message
    const time = Date.now();
    messages[time] = {};
    messages[time].name = req.body.name;
    messages[time].color = req.body.color;
    messages[time].message = req.body.message;

    // once response is created, then set our created message
    // and send response with a message
    responseJSON.message = 'Message Created Successfully';
    handleStoredRequests();
    return res.status(201).json(responseJSON);
};



module.exports = {
    chatPage,
    sendMessage,
    getMessages
};
