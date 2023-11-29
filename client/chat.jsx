const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();


//req.session.account for name and color of current
let userName = "";
let userColor = "";
let lastMessageTime = 0;
let messageRequestActive = false;
let chatFocused = false;


//Handles our FETCH response. This function is async because it
//contains an await.
const handleResponse = async (response, headRequest) => {

  //Grab the content and chat section
  const content = document.querySelector('#content');
  const chatBox = document.querySelector('#chat');

  //Code if there is no body
  if (headRequest) { content.innerHTML += '<p>Meta Data Recieved</p>'; return; }
  if (response.status === 204) { content.innerHTML = '<b>User Updated (No Content)</b>'; return; }

  //Parse the response to json. This works because we know the server always sends back json. 
  //Await because .json() is an async function.
  let obj = await response.json();
  // If getting messages, show the messages in the chatbox
  if (obj.messages) {
    // Code to loop through a js object taken from the Discord Server
    Object.keys(obj.messages).forEach(key => {
      chatBox.innerHTML += `<div class="chat-message">
      <p class="user-name user-${obj.messages[key].color}">${obj.messages[key].name}</p> 
      <p class="user-message message-${obj.messages[key].color}">${obj.messages[key].message}</p>
      </div>`;
    });
    // Auto-scroll chatbox to the bottom if the user isn't interacting with the chat
    if (!chatFocused) {
      let chat = document.querySelector("#chat");
      // this line taken from stackoverflow
      // https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
      chat.scrollTop = chat.scrollHeight;
    }
  }
  // If getting messages, update the lastMessageTime variable
  if (obj.time) {
    lastMessageTime = obj.time;
    // After getting new messages, make a new request for messages
    return sendMessageGet();
  }

  // content is hidden in the browser, but can still be checked in the inspector
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

  //If we have a message, display it.
  if (obj.message) { content.innerHTML += `<p>Message: ${obj.message}</p>`; }
  if (obj.id) { content.innerHTML += `<p>Id: ${obj.id}</p>`; }
  // If getting users, show the users in content
  //if (obj.users) { content.innerHTML += `<p>${JSON.stringify(obj.users)}</p>`; }
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

  // If the post was successful
  if (response.status === 201 || response.status === 204) {
    document.querySelector("#chatbox").style.visibility = "visible";
    document.querySelector("#chat").style.visibility = "visible";

    userName = nameField.value;
    userColor = colorField.value;

    document.querySelector("#messageLabel").classList = `user-name user-${userColor}`;
    document.querySelector("#messageLabel").innerHTML = userName;
    document.querySelector("#messageField").classList = `user-message message-${userColor}`;
  }
  //Once we have a response, handle it.
  handleResponse(response);
};

// Sends the message data to the server
// Uses fetch to send a postRequest. Marksed as async because we use await within it.
const sendMessagePost = async (messageForm) => {
  //Grab all the info from the form
  const messageAction = messageForm.getAttribute('action');
  const messageMethod = messageForm.getAttribute('method');

  //Build a data string in the FORM-URLENCODED format.
  const formData = `name=${sessionStorage.getItem('username')}
  &color=${sessionStorage.getItem('color')}
  &message=${messageForm.querySelector("#messageField").value}
  &_id=${sessionStorage.getItem('_id')}`;

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
  if (response.status === 201) { messageForm.querySelector("#messageField").value = ""; }

  //Once we have a response, handle it.
  handleResponse(response);


};

// Send a request to get users
// Will likely be unneeded in the final version
// const sendUserGet = async (userForm) => {
//   const actionField = userForm.querySelector('#urlField');
//   const methodField = userForm.querySelector('#methodSelect');
//   let response = await fetch(actionField.value, {
//     method: methodField.value,
//     headers: { 'Accept': 'application/json', },
//   });
//   handleResponse(response, methodField.value === 'head');
// }

// Send a request to get messages
const sendMessageGet = async () => {
  messageRequestActive = true;
  let response = await fetch(`/getMessages?time=${lastMessageTime}`, {
    method: 'get',
    headers: { 'Accept': 'application/json', },
  });

  // If the request times out, send it again
  if (response.status === 408 || response.status === 503) {
    return sendMessageGet();
  }

  handleResponse(response, false);
}

const initMessageBox = () => {
  const editForm = document.querySelector('#messageForm');
  const editBox = document.querySelector('#messageField');

  if (!sessionStorage.getItem('color')) {
    helper.sendGet('/getUserColor', (result) => {
      sessionStorage.setItem('color', result.color);
    });
  }
  if (!sessionStorage.getItem('_id')) {
    helper.sendGet('/getUserId', (result) => {
      sessionStorage.setItem('_id', result._id);
    });
  }
  if (!sessionStorage.getItem('userName')) {
    helper.sendGet('/getUserName', (result) => {
      sessionStorage.setItem('userName', result.username);
    });
  }

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (editBox.value) {
      /* Unlike in the basic demo, we are reverting to only
         sending simple text messages to the 'chat message'
         event channel, since the server will handle the
         messaging channel for us.
      */ 
      socket.emit('chat message', {
        message: editBox.value,
        color: sessionStorage.getItem('color'),
        userName: sessionStorage.getItem('userName'),
        _id: sessionStorage.getItem('_id')
      });
      editBox.value = '';
    }

    return false;
  });
};

const initChannelSelect = async () => {
  //const channelSelect = document.getElementById('channelSelect');
  const messages = document.getElementById('content');

  // await channelSelect.addEventListener('change', () => {
  //   messages.innerHTML = '';
  //   socket.emit('room change', channelSelect.value);
  // });
}

const displayMessage = (msg) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message');
  const nameP = document.createElement('p');
  nameP.classList.add(['user-name', `user-${msg.color}`,]);
  nameP.innerHTML = msg.userName;
  messageDiv.appendChild(nameP);
  const messageP = document.createElement('p');
  messageP.classList.add(['user-message', `message-${msg.color}`,]);
  messageP.innerHTML = msg.message;
  messageDiv.appendChild(messageP);
  document.querySelector('#chat').appendChild(messageDiv);
}

const requestInitialMessages = () => { }

// Init function is called when window.onload runs (set below).
// Set up connections and events
const init = () => {
  // Create user form event
  const nameForm = document.querySelector('#nameForm');
  //Create an addUser function that cancels the forms default action and
  //calls our sendPost function above.
  const addUser = (e) => {
    e.preventDefault();
    if (!messageRequestActive) { sendMessageGet(); }
    sendUserPost(nameForm);
    return false;
  }
  //Call addUser when the submit event fires on the form.
  nameForm.addEventListener('submit', addUser);

  // Get user form event
  // Connect the userForm similarly to the nameForm
  // const userForm = document.querySelector('#userForm');
  // const getUser = (e) => {
  //   e.preventDefault();
  //   sendUserGet(userForm);
  //   return false;
  // }
  // userForm.addEventListener('submit', getUser);

  // Post message form event
  const mesageForm = document.querySelector('#messageForm');
  const sendMessage = (e) => {
    e.preventDefault();
    sendMessagePost(mesageForm);
    return false;
  }
  mesageForm.addEventListener('submit', sendMessage);

  // Scrolling the chat messages
  document.querySelector("#chat").addEventListener('mouseenter', () => { chatFocused = true; });
  document.querySelector("#chat").addEventListener('mouseleave', () => { chatFocused = false; });

  //Socket io
  initMessageBox();
  initChannelSelect();
  socket.on('chat message', displayMessage);
};

//When the window loads, run init.
window.onload = init;