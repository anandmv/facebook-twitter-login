var express = require('express'),
 everyauth = require('everyauth'),
 settings = require('./settings.js').settings;
var usersById = {};
var nextUserId = 0;
var usersByFbId = {};
var usersByTwitId = {};
var name="";
everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });
function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}


everyauth
  .facebook
    .appId(settings.facebook_appId)
    .appSecret(settings.facebook_appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
	name=fbUserMetadata.name;
      return usersByFbId = addUser('facebook', fbUserMetadata);
    })
    .redirectPath('/');


everyauth
    .twitter
    .consumerKey(settings.twitter_consumerKey)
    .consumerSecret(settings.twitter_consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
		name=twitUser.name;
      return usersByTwitId = addUser('twitter', twitUser);
    })
    .redirectPath('/');

	var app = express();
	app.use(express.static('public'));
	 app.configure(function() {
	  app.use(express.logger());
	  app.use(express.cookieParser());
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.session({ secret: 'my_test secrect' }));
	  app.use(everyauth.middleware());
	  app.use(app.router);
	});
app.use(express.static('public'));
app.get('/', function(req, res){
		if(name!="")
		{
			res.setHeader("Set-Cookie", ["user="+name]);
		}
  	  res.redirect('index.html');
});
app.get('/logout',function(req,res){
		res.setHeader("Set-Cookie", ["user=''"]);
      req.logout()
});
app.listen(settings.port);
console.log("Server running on "+settings.port);