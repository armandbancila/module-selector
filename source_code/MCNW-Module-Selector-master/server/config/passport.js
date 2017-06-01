var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var mysql = require('./connect_db.js');
var getConnection = mysql.getConnection;
var users = require('../models/user.js');

/**
 *@module Passport Config
 */


/**
 * Class representing the authentication process.
 * Uses passport dependency.
 */

/**
 * Function configuring the authentication strategy. 
 * @param {passport} passport - The dependency to be used for the authentication procedure.
 * 
 */
module.exports = function(passport) {

	/**
	 * Function for adding a user session to the database.
	 * @param {user} - The user object.
	 * @param {function} callback - What to do with the result of the function.
	 */
    passport.serializeUser(function(user, callback) {
        callback(null, user.UserID);
    });

  	/**
	 * Function for accessing the user's session and data on request.
	 * @param {string} id - The user's id.
	 * @param {function} callback - What to do with the result of the function.
	 */
    passport.deserializeUser(function(id, callback) {
        getConnection((err, connection)=>{
					if(err){
						console.log(err);
						callback(err, null);
					}else{					
						connection.query("SELECT UserID, FName, LName, AccessGroup FROM User WHERE UserID = ? ",[id], function(err, rows){
							var user = false;
							if(!err&&rows.length ==1) user = rows[0];
								callback(err, user);
							connection.release();
        		});
					}
				});
    });

 
/**
 * Function for signin up a user if the user does not already exists.
 * If the user exists already sends error USER_EXISTS.
 * Adds the new user to the database through addUser.
 * @param {string} req - The request sent.
 * @param {string} userID - The user's id.
 * @param {string} password - The user's password.
 * @param {function} callback - What to do with the result of the function.
 */
passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'userID',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, userID, password, callback) {
						users.addUser(userID, req.body.fName, req.body.lName, password, 2, (err, rows, hash)=>{
								if(err){
									if(err.message == 'USER_EXISTS') callback(null, false);
									else return callback(err);
								} else{
										var newUser = {
                        UserID: userID,
                        Password: hash
										}
										callback(null, newUser);

								}
						});            
				
        })
);

/**
 * Function for logging in a user.
 * If the user doesn't exist sends error USER_DOESN'T_EXIST.
 * If the password is wrong sends error WRONG_PASSWORD.
 * @param {string} req - The request sent.
 * @param {string} userID - The user's id.
 * @param {string} password - The user's password.
 * @param {function} callback - What to do with the result of the function.
 */
passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'userID',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, userID, password, callback) { 
            users.authorize(userID, password, (err, user)=>{
								if(err){
									switch(err.message){
										case 'USER_DOESN\'T_EXIST': 
											callback(null, false, { message : 'invalid e-mail address' });
											break;
										case 'WRONG_PASSWORD':
											callback(null, false, { message : 'invalid password' });
											break;
										default:
										 callback(err);
									}
								}else	callback(null, user);
						});  
				})
);


}
