let userName = "";
let userColor = "";
let lastMessageTime = 0;


//Handles our FETCH response. This function is async because it
//contains an await.
const handleResponse = async (response, headRequest) => {

  //Grab the content and chat section
  const content = document.querySelector('#content');
  const chatBox = document.querySelector('#chat');

  //Based on the status code, display something
  switch (response.status) {
    case 200: //success
      content.innerHTML = `<b>Success</b>`;
      break;
    case 201: //created
      content.innerHTML = '<b>Created</b>';
      break;
    case 204: //updated (no response back from server)
      content.innerHTML = '<b>Updated (No Content)</b>';
      return;
    case 400: //bad request
      content.innerHTML = `<b>Bad Request</b>`;
      break;
    case 404: //not found
      content.innerHTML = `<b>Not Found</b>`;
      break;
    default: //any other status code
      content.innerHTML = `Error code not implemented by client.`;
      break;
  }

  if (headRequest) { content.innerHTML += '<p>Meta Data Recieved</p>'; return; }

  //Parse the response to json. This works because we know the server always
  //sends back json. Await because .json() is an async function.
  let obj = await response.json();

  //If we have a message, display it.
  if (obj.message) { content.innerHTML += `<p>Message: ${obj.message}</p>`; }
  if (obj.id) { content.innerHTML += `<p>Id: ${obj.id}</p>`; }
  // If getting users, show the users in content
  if (obj.users) { content.innerHTML += `<p>${JSON.stringify(obj.users)}</p>`; }
  // If getting messages, show the messages in the chatbox
  if (obj.messages) { 
    Object.keys(obj.messages).forEach(key => {
      chatBox.innerHTML += `<p>${obj.messages[key].name}: ${obj.messages[key].message}</p>`;
    });
  }
  // If getting messages, update the lastMessageTime variable
  if (obj.time) { lastMessageTime = obj.time; }
};

// Sends the user data to the server
// Uses fetch to send a postRequest. Marksed as async because we use await within it.
const sendUserPost = async (nameForm) => {
  //Grab all the info from the form
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');

  const nameField = nameForm.querySelector('#nameField');
  const colorField = nameForm.querySelector('#colorField');

  //Build a data string in the FORM-URLENCODED format.
  const formData = `name=${nameField.value}&color=${colorField.value}`;

  //Make a fetch request and await a response. Set the method to
  //the one provided by the form (POST). Set the headers. Content-Type
  //is the type of data we are sending. Accept is the data we would like
  //in response. Then add our FORM-URLENCODED string as the body of the request. 
  let response = await fetch(nameAction, {
    method: nameMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: formData,
  });

  //Once we have a response, handle it.
  handleResponse(response);
  userName = nameField.value;
  userColor = colorField.value;
};

// Sends the message data to the server
// Uses fetch to send a postRequest. Marksed as async because we use await within it.
const sendMessagePost = async (messageForm) => {
  //Grab all the info from the form
  const messageAction = messageForm.getAttribute('action');
  const messageMethod = messageForm.getAttribute('method');

  //Build a data string in the FORM-URLENCODED format.
  const formData = `name=${userName}&color=${userColor}&message=${messageForm.querySelector("#messageField").value}`;

  //Make a fetch request and await a response. Set the method to
  //the one provided by the form (POST). Set the headers. Content-Type
  //is the type of data we are sending. Accept is the data we would like
  //in response. Then add our FORM-URLENCODED string as the body of the request.
  let response = await fetch(messageAction, {
    method: messageMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: formData,
  });

  //Clear message form if response went well
  if(response.status === 201) { messageForm.querySelector("#messageField").value = ""; }

  //Once we have a response, handle it.
  handleResponse(response); 

  
};

// Send a request to get users
// Will likely be unneeded in the final version
const sendUserGet = async (userForm) => {
  const actionField = userForm.querySelector('#urlField');
  const methodField = userForm.querySelector('#methodSelect');
  let response = await fetch(actionField.value, {
    method: methodField.value,
    headers: { 'Accept': 'application/json', },
  });

  handleResponse(response, methodField.value === 'head');
}

// Send a request to get messages
const sendMessageGet = async () => {

  let response = await fetch(`/getMessages?time=${lastMessageTime}`, {
    method: 'get',
    headers: { 'Accept': 'application/json', },
  });

  handleResponse(response, false);
}

// Init function is called when window.onload runs (set below).
// Set up connections and events
const init = () => {
  // Create user form event
  const nameForm = document.querySelector('#nameForm');
  //Create an addUser function that cancels the forms default action and
  //calls our sendPost function above.
  const addUser = (e) => {
    e.preventDefault();
    sendUserPost(nameForm);
    return false;
  }
  //Call addUser when the submit event fires on the form.
  nameForm.addEventListener('submit', addUser);

  // Get user form event
  // Connect the userForm similarly to the nameForm
  const userForm = document.querySelector('#userForm');
  const getUser = (e) => {
    e.preventDefault();
    sendUserGet(userForm);
    return false;
  }
  userForm.addEventListener('submit', getUser);

  // Post message form event
  const mesageForm = document.querySelector('#chatBox');
  const sendMessage = (e) => {
    e.preventDefault();
    sendMessagePost(mesageForm);
    return false;
  }
  mesageForm.addEventListener('submit', sendMessage);

  // Get messages button event
  const getMessageBtn = document.querySelector("#getMessageBtn");
  const getMessages = (e) => {
    e.preventDefault();
    sendMessageGet();
    return false;
  }
  getMessageBtn.addEventListener('click', getMessages);
};

//When the window loads, run init.
window.onload = init;