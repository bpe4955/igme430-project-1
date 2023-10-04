/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/client.js":
/*!**************************!*\
  !*** ./client/client.js ***!
  \**************************/
/***/ (() => {

eval("// Taken from body-parse-example-done\r\n    //Handles our FETCH response. This function is async because it\r\n    //contains an await.\r\n    const handleResponse = async (response, headRequest) => {\r\n      \r\n        //Grab the content section\r\n        const content = document.querySelector('#content');\r\n  \r\n        //Based on the status code, display something\r\n        switch(response.status) {\r\n          case 200: //success\r\n            content.innerHTML = `<b>Success</b>`;\r\n            break;\r\n          case 201: //created\r\n            content.innerHTML = '<b>Created</b>';\r\n            break;\r\n          case 204: //updated (no response back from server)\r\n            content.innerHTML = '<b>Updated (No Content)</b>';\r\n            return;\r\n          case 400: //bad request\r\n            content.innerHTML = `<b>Bad Request</b>`;\r\n            break;\r\n          case 404: //not found\r\n            content.innerHTML = `<b>Not Found</b>`;\r\n            break;\r\n          default: //any other status code\r\n            content.innerHTML = `Error code not implemented by client.`;\r\n            break;\r\n        }\r\n  \r\n        if(headRequest) { content.innerHTML += '<p>Meta Data Recieved</p>'; return;}\r\n  \r\n        //Parse the response to json. This works because we know the server always\r\n        //sends back json. Await because .json() is an async function.\r\n        let obj = await response.json();\r\n        \r\n        //If we have a message, display it.\r\n        if(obj.message){ content.innerHTML += `<p>Message: ${obj.message}</p>`; }\r\n        if(obj.id) { content.innerHTML += `<p>Id: ${obj.id}</p>`;}\r\n        if(obj.users) { content.innerHTML += `<p>${JSON.stringify(obj.users)}</p>`; }\r\n      };\r\n  \r\n      //Uses fetch to send a postRequest. Marksed as async because we use await\r\n      //within it.\r\n      const sendPost = async (nameForm) => {\r\n        //Grab all the info from the form\r\n        const nameAction = nameForm.getAttribute('action');\r\n        const nameMethod = nameForm.getAttribute('method');\r\n        \r\n        const nameField = nameForm.querySelector('#nameField');\r\n        const ageField = nameForm.querySelector('#ageField');\r\n  \r\n        //Build a data string in the FORM-URLENCODED format.\r\n        const formData = `name=${nameField.value}&age=${ageField.value}`;\r\n  \r\n        //Make a fetch request and await a response. Set the method to\r\n        //the one provided by the form (POST). Set the headers. Content-Type\r\n        //is the type of data we are sending. Accept is the data we would like\r\n        //in response. Then add our FORM-URLENCODED string as the body of the request.\r\n        let response = await fetch(nameAction, {\r\n          method: nameMethod,\r\n          headers: {\r\n            'Content-Type': 'application/x-www-form-urlencoded',\r\n            'Accept': 'application/json',\r\n          },\r\n          body: formData,\r\n        });\r\n  \r\n        //Once we have a response, handle it.\r\n        handleResponse(response);\r\n      };\r\n  \r\n      const sendGet = async (userForm) => {\r\n        const actionField = userForm.querySelector('#urlField');\r\n        const methodField = userForm.querySelector('#methodSelect');\r\n        let response = await fetch (actionField.value, {\r\n          method: methodField.value,\r\n          headers: { 'Accept': 'application/json', },\r\n        });\r\n  \r\n        handleResponse(response, methodField.value === 'head');\r\n      }\r\n  \r\n      //Init function is called when window.onload runs (set below).\r\n      const init = () => {\r\n        //Grab the form\r\n        const nameForm = document.querySelector('#nameForm');\r\n        //Create an addUser function that cancels the forms default action and\r\n        //calls our sendPost function above.\r\n        const addUser = (e) => {\r\n          e.preventDefault();\r\n          sendPost(nameForm);\r\n          return false;\r\n        }\r\n        //Call addUser when the submit event fires on the form.\r\n        nameForm.addEventListener('submit', addUser);\r\n        \r\n        // Connect the userForm similarly to the nameForm\r\n        const userForm = document.querySelector('#userForm');\r\n        const getUser = (e) => {\r\n          e.preventDefault();\r\n          sendGet(userForm);\r\n          return false;\r\n        }\r\n        userForm.addEventListener('submit', getUser);\r\n  \r\n      };\r\n  \r\n      //When the window loads, run init.\r\n      window.onload = init;\n\n//# sourceURL=webpack://igme430-project-1/./client/client.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./client/client.js"]();
/******/ 	
/******/ })()
;