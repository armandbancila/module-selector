var getConnection = require('../config/connect_db.js').getConnection;
var bcrypt = require('bcrypt');
var handleMail = require('../config/mail_config.js').handleMail;
var async = require('async');
var crypto = require('crypto');

/**
 *@module Users
 */



/**
 *Class representing what a User can do.
 */



var checkUserExists = function(connection, userID, callback){
	async.waterfall([(done)=>connection.query("SELECT * FROM User WHERE UserID = ?",[userID], (err, rows)=> done(err,rows)),
		(rows, done)=> done(null, rows.length?true:false)],
		(err,exists)=>callback(err,exists));
};

/**
 * Function for creating a guest user. Adds guest user in database and 
 * checks if sessionlink already exists to avoid duplicate values.
 * @param {string} sessionID - The guests new sessionID.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.createGuest = function(sessionID, callback){
	var inserted = false;
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err, connection) => {connectionHandle = connection; done(err,connection);}),
					(connection, done)=>async.until(()=>{return inserted;},
															(done)=>connection.query('INSERT INTO User(UserID, AccessGroup, SessionLink) VALUES (CONCAT(\'Guest\',REPLACE(UUID(), "-", "")), 2, (?))', 
																	 		[sessionID], (err, rows)=>{
																				if(err){
																					if(err.code != 'ER_DUP_ENTRY') return done(err);
																					else if(err.message.includes('SessionLink')) inserted = true;
																				}else inserted = true;
																				done(null);
																			}), (err)=> done(err, connection)),
					(connection,done)=> connection.query("SELECT UserID, FName, LName, AccessGroup FROM User WHERE SessionLink = ? ", [sessionID], (err,rows)=>done(err,rows)),
					(rows, done)=>done(null, rows[0])],
					(err, user)=>{if(connectionHandle) connectionHandle.release();
																		callback(err, user);});

};

/**
 * Function for retrieving a users by access group. 
 * If no access group is put retrieves all users. 
 * @param {int | Int[]} groups - The access group number.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getUsers = function(groups, callback){
	if(groups)  groups = Array.isArray(groups) ? groups : [groups];
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT UserID, FName, LName, AccessGroup FROM User WHERE '+
																											 '(CASE WHEN '+ (groups ? 'true' : 'false') +' THEN AccessGroup IN (?) ELSE 1=1 END) '+
																											 'AND SessionLink IS NULL',[groups], (err,rows)=> done(err,rows))],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();
																callback(err, rows);});
	
};

/**
 * Function for adding a user to the database. 
 * Checks if user already exists and hashes password if new user. 
 * @param {string} userID - The user's email.
 * @param {string} fName - The user's first name.
 * @param {string} lName - The user's last name.
 * @param {string} password - The user's password.
 * @param {int} accessLevel - The user's access group, can only be 2 initially.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addUser = function(userID, fName, lName, password, accessLevel,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>checkUserExists(connection, userID, (err, found)=>done(err, found, connection)),
									(found, connection, done)=> done((found?new Error('USER_EXISTS'):null), connection),
									(connection, done)=>bcrypt.hash(password, 10, (err, hash)=>done(err, hash, connection)),
									(hash, connection, done)=>connection.query('INSERT INTO User(UserID, FName, LName, Password, AccessGroup) VALUES ((?),(?),(?),(?),(?))',
																					[userID, fName, lName, hash, accessLevel], (err, rows)=>done(err, rows, hash))],
									(err, rows, hash)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows, hash);});
};


/**
 * Function for updating a user's information. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * @param {string} userID - The user's email.
 * @param {string} newUserID - The user's new email, can be new or the same.
 * @param {string} fName - The user's new or same first name.
 * @param {string} lName - The user's new or same last name.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.updateUser = function(userID, newUserID, fName, lName, callback){ 
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('UPDATE User SET UserID = ?, FName = (?), LName = (?) WHERE UserID = (?)',
																											 [newUserID, fName, lName, userID], (err, rows)=>done(err, rows)),
									(rows, done)=>done(rows.affectedRows == 0 ? new Error('USER_DOESN\'T_EXIST'): null)],
									(err)=>{if(connectionHandle) connectionHandle.release();
																callback(err);});
};

/**
 * Function for deleting a user from the database.  
 * @param {string} userID - The email of the user to be deleted.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.deleteUser = function(userID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM User WHERE UserID = (?)', [userID.toString()], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
														callback(err);});
};

/**
 * Function for authorizing a user. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * If user gives wrong password sends back error WRONG_PASSWORD.
 * @param {string} userID - The user's email.
 * @param {string} newUserID - The user's new email, can be new or the same.
 * @param {string} fName - The user's new or same first name.
 * @param {string} lName - The user's new or same last name.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.authorize = function(userID, password,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT * FROM User WHERE UserID = (?)', [userID], (err, rows)=>done(err, rows)),
									(rows,done)=>done(rows.length == 0 ? new Error('USER_DOESN\'T_EXIST'): null, rows),
									(rows,done)=>bcrypt.compare(password, rows[0].Password.toString(), (err, resp)=>done(err,rows[0],resp)),
									(user, resp, done)=>done(resp?null:new Error('WRONG_PASSWORD'),user)],
									(err, user)=>{if(connectionHandle) connectionHandle.release();
														callback(err, user);});
};

/**
 * Function for getting the access group of a user. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * @param {string} userID - The user's email.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getAccessGroup = function(userID,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT AccessGroup FROM User WHERE UserID = (?)', [userID], (err, rows)=>done(err, rows)),
									(rows,done)=>done(rows.length == 0 ? new Error('USER_DOESN\'T_EXIST'): null, rows[0]),
									(user,done)=>done(null, user.AccessGroup)],
									(err, accessG)=>{if(connectionHandle) connectionHandle.release();
														callback(err, accessG);});
};

/**
 * Function for setting the access group of a user. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * Need to be an administrator to do this.
 * @param {string} userID - The user's email.
 * @param {int} accessGroup - The user's new access group.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.setAccessGroup = function(userID,accessGroup,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('UPDATE User SET AccessGroup=(?) WHERE UserID = (?)', [accessGroup,userID], (err, rows)=>done(err, rows)),
									(rows,done)=>done(rows.affectedRows === 0 ? new Error('USER_DOESN\'T_EXIST'): null, rows),
									(rows,done)=>done(null, rows)],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows);});
};

/**
 * Function for re-setting the password of a user. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * Need to be an administrator to do this.
 * @param {string} userID - The user's email.
 * @param {string} password - The user's new password.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.resetPassword = function(userID, password,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>checkUserExists(connection, userID, (err, found)=>done(err, found, connection)),
									(found, connection, done)=> done((found?null:new Error('USER_DOESN\'T_EXIST')), connection),
									(connection, done)=>bcrypt.hash(password, 10, (err, hash)=>done(err, hash, connection)),
									(hash, connection, done)=>connection.query('UPDATE User SET Password=(?) WHERE UserID = (?)',
																				[hash,userID], (err, rows)=>done(err, rows, hash))],
									(err, rows, hash)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows, hash);});
};

function saveToken(connection, userID, token, expiryDate, callback){
	async.waterfall([(done)=>connection.query('INSERT INTO ResetToken (Token, ExpiryDate, UserID) VALUES ((?),(?),(?)) '+
											  'ON DUPLICATE KEY UPDATE Token = VALUES(Token), expiryDate = VALUES(ExpiryDate)',[token, expiryDate,userID], 
											  (err,rows)=> done(err,rows))],
		(err)=>callback(err,token));
};

/**
 * Function for requesting the reset of a user's password. 
 * If user doesn't exist sends back an error USER_DOESN'T_EXIST. 
 * Creates a unique token for the user valid for an hour and send an email to the user
 * with the token to reset the password.
 * @param {string} host - The host of the website.
 * @param {string} userID - The user's email.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.requestReset = function(host, userID,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>checkUserExists(connection, userID, (err, found)=>done(err, found, connection)),
									(found, connection, done)=> done((found?null:new Error('USER_DOESN\'T_EXIST')),connection),
									(connection,done)=>crypto.randomBytes(20, (err,buf)=>done(err,buf.toString('hex'),connection)),
									(token, connection, done)=>saveToken(connection,userID, token, (Date.now() + 3600000)/1000, done),
									(token, done)=> {var text = 'You are receiving this because you (or someone else) has requested the reset of the password for your'+ 
													 				'account.\n\n' +
          								 							'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          								 							'http://' + host + '/#!/reset-password/' + token + '\n\n' +
          								 							'If you did not request this, please ignore this email and your password will remain unchanged.\n';
														var html = null;
														handleMail(text,html,userID,done)}],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows);});
};

/**
 * Function for validating a user's token when wanting to reset his password. 
 * Checks if the token is still valid and is linked to the same user as the one requesting for the reset.
 * @param {string} token - The user's temporary token.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.validateToken = function(token,callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT * FROM ResetToken WHERE Token = (?)', [token], (err, rows)=>done(err, rows)),
									(rows,done)=>done(null,(rows.length == 0 ? false: rows[0])),
									(tokenRecord,done)=>done(null,((tokenRecord && tokenRecord.Token == token && tokenRecord.ExpiryDate >= (Date.now()/1000)) ? true : false), tokenRecord.UserID)],
									(err, validated, user)=>{if(connectionHandle) connectionHandle.release();
														callback(err, validated, user);});
};

/****************************************************************FEEDBACK*********************************************************************/

/**
 * Function for adding feedback when a user deactivates his account.  
 * Can rate the website, 1 is lowest and 5 is highest.
 * Adds a time stamp to the feedback.
 * @param {int} usefulness - Number between 1 and 5.
 * @param {int} usability - Number between 1 and 5.
 * @param {int} informative - Number between 1 and 5.
 * @param {int} security - Number between 1 and 5.
 * @param {int} acessibility - Number between 1 and 5.
 * @param {string} reasons - The user's reasons for leaving.
 * @param {string} comments - The user's comments.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addFeedback = function(usefulness, usability, informative, security, accessibility, reasons, comments, callback){
	var ratings = "Usefulness : " + usefulness + ", Usability : " + usability + ", Informative : " + informative + ",  Security : " + security + ", Accessibilty : " + accessibility;
	
	var today = (new Date()).toISOString().substring(0, 10);
	
	getConnection((err, connection) =>{
			if(err) callback(err);
			else{
				connection.query('INSERT INTO Feedback (Day, Ratings, Reasons, Comments) VALUES ((?),(?),(?),(?))', [today, ratings, reasons, comments], function(err, rows){
					 callback(err,rows);
		    		connection.release();
			});
		}
					
	});
};

/**
 * Function for retrieving all the feedback on the web application.  
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getFeedback = function(callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT * FROM Feedback', (err, rows)=>done(err, rows))],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows);});
};

/**
 * Function for delete all the feedback up to a given date.
 * If not date is given, deletes all feedback.
 * @param {string} day - The date in the form yyyy-mm-dd.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.clearFeedback = function(day, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM Feedback WHERE (CASE WHEN '+ (day ? 'true' : 'false') + ' THEN Day <= ? ELSE 1 = 1 END)',
																											 [day], (err, rows)=>done(err, rows)),
									(rows,done)=>done(rows.affectedRows == 0 ? new Error('NOT_FOUND'): null)],
									(err)=>{if(connectionHandle) connectionHandle.release();
														callback(err);});
};
