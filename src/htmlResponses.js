const fs = require('fs');
const url = require('url');

// Directors to files
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../hosted/main.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

const urlStruct = {
  '/': index,
  '/hosted/main.css': style,
  '/bundle.js': js,
};

// Get html data, such as html pages, css, and client js
const getPage = (request, response) => {
  const parsedURL = url.parse(request.url);
  let contentType = 'text/html';
  if (parsedURL.pathname.includes('.css')) { contentType = 'text/css'; } else if (parsedURL.pathname.includes('.js')) { contentType = 'text/javascript'; }

  response.writeHead(200, { 'Content-Type': contentType });
  if (urlStruct[parsedURL.pathname]) {
    response.write(urlStruct[parsedURL.pathname]);
  } else {
    response.write(index);
  }
  response.end();
};

module.exports = { getPage };
