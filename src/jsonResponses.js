// Stores the users (temp)
const users = {};
const messages = {};
//const requests = {}; // For Long-Polling

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
const getUsers = (request, response, head) => {
  if (!head) {
    const responseJSON = { users };
    return respondJSON(request, response, 200, responseJSON);
  }
  return respondJSONMeta(request, response, 200);
};
// return messages object as JSON
const getMessages = (request, response, params, head) => {
  if (!head) {
    const requestTime = Date.now();
    const clientTime = params.time;
    const messagesToSend = {};
    Object.keys(messages).forEach((key) => {
      if (key >= clientTime) { messagesToSend[key] = messages[key]; }
    });
    // If no messages to send, send success
    if (!messagesToSend) { return respondJSONMeta(request, response, 204); }
    const responseJSON = { messagesToSend, time: requestTime };
    return respondJSON(request, response, 200, responseJSON);
  }
  return respondJSONMeta(request, response, 200);
};

// function to add a user from a POST body
const addUser = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name and color are both required.',
  };

  if (!body) {
    responseJSON.message = 'No body sent with POST request';
    responseJSON.id = 'noBodySent';
    return respondJSON(request, response, 501, responseJSON);
  }

  // check to make sure we have both fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  if (!body.name || !body.color) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 204 updated
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
  // 204 has an empty payload, just a success
  // It cannot have a body, so we just send a 204 without a message
  // 204 will not alter the browser in any way!!!
  return respondJSONMeta(request, response, responseCode);
};

const addMessage = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Name, Color, and Message are required.',
  };

  if (!body) {
    responseJSON.message = 'No body sent with POST request';
    responseJSON.id = 'noBodySent';
    return respondJSON(request, response, 501, responseJSON);
  }

  // If either are missing, send back an error message as a 400 badRequest
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

  // if response is created, then set our created message
  // and sent response with a message
  responseJSON.message = 'Message Created Successfully';
  return respondJSON(request, response, 201, responseJSON);
};
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
  getMessages,
  addUser,
  addMessage,
  notFound,
};
