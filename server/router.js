const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/chat', mid.requiresLogin, controllers.Chat.chatPage);
  app.post('/chat', mid.requiresLogin, controllers.Chat.sendMessage);
  app.get('/getMessages', mid.requiresLogin, controllers.Chat.getMessages);

  app.get('/settings', mid.requiresLogin, controllers.Account.settingsPage);

  app.post('/changePass', mid.requiresLogin, controllers.Account.changePass);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
