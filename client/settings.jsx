const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');


const handlePassChange = (e) => {
    e.preventDefault();
    console.log('Called handlePassChange');
    const oldPass = e.target.querySelector('#oldpass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!oldPass || !pass || !pass2) {
        return false;
    }
    if (pass !== pass2) {
        return false;
    }
    if (oldPass === pass) {
        return false;
    }

    helper.sendPost(e.target.action, { oldPass, pass, pass2 }, result => {
        if(result.message){
            document.querySelector("#changePassForm").reset();
        }
    });

    return false;
};



// Functional stateless component for SignupWindow
const ChangePassWindow = (props) => {
    return (
        <div class='mainForm'>
            <h3>Change&nbsp;Password</h3>
        <form action='/changePass' onSubmit={handlePassChange} method='POST'
            name='changePassForm' id='changePassForm'>
            <label htmlFor='currentpass'>Old&nbsp;Pass: </label>
            <input id='oldpass' type='text' name='currentpass' placeholder='Current Pass' />
            <label htmlFor='pass'>Password: </label>
            <input id='pass' type='text' name='pass' placeholder='password' />
            <label htmlFor='pass2'>Password: </label>
            <input id='pass2' type='text' name='pass2' placeholder='retype password' />
            <input type='submit' className='formSubmit' value='Change' />
        </form>
        </div>
    );
};

const init = () => {
    const loginButton = document.querySelector('#loginButton');
    const signupButton = document.querySelector('#signupButton');

    console.log('running settings.jsx');

    ReactDOM.render(<ChangePassWindow />,
            document.querySelector('#content'));

};

window.onload = init;