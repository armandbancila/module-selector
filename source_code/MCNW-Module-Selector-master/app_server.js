var express = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var app = express();
var db = require('./server/config/connect_db.js');
var mySQLStore = require('express-mysql-session')(session);
var sessionStore;
var passportSetup = require('./server/config/passport.js');
db.connect(process.env.NODE_ENV === 'test' ?  db.TEST_MODE : db.PRODUCTION_MODE, ()=>{
	sessionStore = new mySQLStore({
		checkExpirationInterval: 900000,
		schema: {
    	tableName: 'Session',
      	columnNames: {
            session_id: 'SessionID',
            expires: 'Expires',
            data: 'Data'
        }
    }},db.state.pool);
	console.log('Connecting to database in '+db.state.mode);
	passportSetup(passport); 

	app.use(morgan('dev')); 
	app.use(cookieParser()); 
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.use(session({
		secret: 'kclwebappsecretsession',
		resave: true,
		saveUninitialized: true,
		store: sessionStore,
		cookie: { maxAge: 7*24*3600000}
	 } )); 
	app.use(passport.initialize());
	app.use(passport.session()); 



	require('./server/routes.js')(app, passport); 
	var server = app.listen(process.env.PORT || 8000, ()=> console.log('Server listening on port '+(process.env.PORT || 8000)+'...'));

	module.exports = server;
});



