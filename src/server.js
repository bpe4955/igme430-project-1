const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getPage,
  '/style.css': htmlHandler.getPage,
  '/bundle.js': htmlHandler.getPage,
  '/getUsers': jsonHandler.getUsers,
  '/addUser': jsonHandler.addUser,
  '/notReal': jsonHandler.notFound,
};

// Handle get requests, such as getting the html page or data
const handleGet = (request, response, params, parsedURL) => {
  if (urlStruct[parsedURL.pathname]) {
    urlStruct[parsedURL.pathname](request, response/* , params */);
  } else {
    urlStruct['/notReal'](request, response/* , params */);
  }
};

// Handle post requests, mainly adding users to data
const handlePost = (request, response, params, parsedURL) => {
  if (!urlStruct[parsedURL.pathname]) { urlStruct['/notReal'](request, response/* , params */); }

  const body = [];

  // Handle a request error
  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  // Handle recieving data
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // What to do once all the data has been obtained
  request.on('end', () => {
    // Connect the body into one string then turn that string into an object
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    // const bodyParams = JSON.parse(bodyString);

    urlStruct[parsedURL.pathname](request, response, bodyParams);
  });
};

const handleHead = (request, response, params, parsedURL) => {
  if (urlStruct[parsedURL.pathname]) {
    urlStruct[parsedURL.pathname](request, response, true);
  } else {
    urlStruct['/notReal'](request, response, true);
  }
};

// Take in requests and send them off to cooresponding functions to be handled
const onRequest = (request, response) => {
  console.log(request.url);
  console.log(request.method);

  const parsedURL = url.parse(request.url);
  const params = query.parse(parsedURL.query);

  if (request.method === 'POST') { handlePost(request, response, params, parsedURL); } else if (request.method === 'GET') { handleGet(request, response, params, parsedURL); } else if (request.method === 'HEAD') { handleHead(request, response, params, parsedURL); }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
