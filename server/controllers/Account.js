const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const settingsPage = (req, res) => res.render('settings');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  // Error Checking
  if (!username || !pass) { return res.status(400).json({ error: 'All fields are required!' }); }
  // Check username/password with Account model
  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) { return res.status(400).json({ error: 'Wrong username or password!' }); }
    // Successful login
    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/chat' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  // Error Checking
  if (!username || !pass || !pass2) { return res.status(400).json({ error: 'All fields are required!' }); }
  if (pass !== pass2) { return res.status(400).json({ error: 'Passwords do not match!' }); }
  // Hashing and creating user
  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    // Successfully made new user
    req.session.account = Account.toAPI(newAccount);
  } catch (err) {
    console.log(err);
    // Duplicate name
    if (err.code === 11000) { return res.status(400).json({ error: 'Username already in use!' }); }
    // Server Error
    return res.status(500).json({ error: 'An error occured!' });
  }
  return res.json({ redirect: '/chat' });
};

const changePass = async (req, res) => {
  const oldPass = `${req.body.oldPass}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;
  // Error Checking
  if (!oldPass || !pass || !pass2) { return res.status(400).json({ error: 'All fields are required!' }); }
  if (pass !== pass2) { return res.status(400).json({ error: 'Passwords do not match!' }); }

  // If old password is valid
  return Account.authenticate(req.session.account.username, oldPass, async (err, account) => {
    if (err || !account) { return res.status(400).json({ error: 'Wrong password!' }); }
    // Correct Current Password

    // Hashing and updating user
    try {
      const hash = await Account.generateHash(pass);
      await Account.updateOne({ _id: req.session.account._id }, { password: hash });
      // Successfully updated Password
      req.session.account = Account.toAPI(account);
      return res.status(200).json({ message: 'Password Updated!' });
    } catch (error) {
      console.log(error);
      // Server Error
      return res.status(500).json({ error: 'An error occured!' });
    }
  });
};

module.exports = {
  loginPage,
  settingsPage,
  logout,
  login,
  signup,
  changePass,
};
