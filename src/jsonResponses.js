// Server Storage
const users = {};
const messages = {};
let requests = {}; // For Long-Polling

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body (HEAD)
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return user object as JSON
const getUsers = (request, response, params, head) => {
  if (!head) {
    const responseJSON = { users };
    return respondJSON(request, response, 200, responseJSON);
  }
  return respondJSONMeta(request, response, 200);
};
// return messagesToSend object as JSON
// this object contains all the messages that the user doesn't already have
// also return the time this response was recieved to keep track of what the user has
const getMessages = (request, response, params, head) => {
  if (!head) {
    const requestTime = Date.now();
    const clientTime = params.time;
    const messagesToSend = {};
    Object.keys(messages).forEach((key) => {
      if (key > clientTime) { messagesToSend[key] = messages[key]; }
    });
    // If no messages to send, send success
    if (Object.keys(messagesToSend).length === 0) {
      return respondJSON(request, response, 200, { time: requestTime });
    }
    const responseJSON = { messages: messagesToSend, time: requestTime };
    return respondJSON(request, response, 200, responseJSON);
  }
  return respondJSONMeta(request, response, 200);
};

// Function for long polling messages
// stores requests in an object on the server
const requestMessages = (request, response, params, head) => {
  // Initial request will go through and not be stored
  if (params.time === '0') { return getMessages(request, response, params, head); }
  // Requests will be fulfilled if there currently is a message for them
  if (Object.keys(messages)[Object.keys(messages).length - 1] > params.time) {
    return getMessages(request, response, params, head);
  }

  // If there's currently no message to serve, add the response to responses{}
  requests[request] = {};
  requests[request].request = request;
  requests[request].response = response;
  requests[request].params = params;
  requests[request].head = head;
  return false;
};

// Called once a message is posted
// Handles all long poll requests for messages
const handleStoredRequests = () => {
  Object.keys(requests).forEach((request) => {
    getMessages(
      requests[request].request,
      requests[request].response,
      requests[request].params,
      requests[request].head,
    );
  });
  requests = {};
};

// function to add a user from a POST body
const addUser = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and color are both required.',
  };

  // If the post request is empty
  if (!body) {
    responseJSON.message = 'No body sent with POST request';
    responseJSON.id = 'noBodySent';
    return respondJSON(request, response, 501, responseJSON);
  }

  // check to make sure we have both fields
  // If either are missing, send back an error message as a 400 badRequest
  if (!body.name || !body.color) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 204 (updated)
  let responseCode = 204;

  // If the user doesn't exist yet
  if (!users[body.name]) {
    // Set the status code to 201 (created) and create an empty user
    responseCode = 201;
    users[body.name] = {};
  }

  // add or update fields for this user name
  users[body.name].name = body.name;
  users[body.name].color = body.color;

  // if response is created, then set our created message
  // and sent response with a message
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
  // If the user was just updated, return 204
  return respondJSONMeta(request, response, responseCode);
};

// function to add a message from a POST body
const addMessage = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name, Color, and Message are required.',
  };

  // If the post request is empty
  if (!body) {
    responseJSON.message = 'No body sent with POST request';
    responseJSON.id = 'noBodySent';
    return respondJSON(request, response, 501, responseJSON);
  }

  // If something is missing, send back an error message as a 400 badRequest
  if (!body.name || !body.color || !body.message) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // add fields for this message
  const time = Date.now();
  messages[time] = {};
  messages[time].name = body.name;
  messages[time].color = body.color;
  messages[time].message = body.message;

  // once response is created, then set our created message
  // and send response with a message
  responseJSON.message = 'Message Created Successfully';
  handleStoredRequests();
  return respondJSON(request, response, 201, responseJSON);
};

// function for searching outside of parameters
const notFound = (request, response, head) => {
  if (!head) {
    const responseJSON = {
      message: 'The data you are looking for cannot be found',
      id: 'notFound',
    };
    return respondJSON(request, response, 404, responseJSON);
  }
  return respondJSONMeta(request, response, 404);
};

// public exports
module.exports = {
  getUsers,
  requestMessages,
  addUser,
  addMessage,
  notFound,
};
