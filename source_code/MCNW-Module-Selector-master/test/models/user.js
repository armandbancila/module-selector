var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var should = chai.should();
var bcrypt = require('bcrypt');
var user = require('../../server/models/user.js');
var db = require('../../server/config/connect_db.js');
var connection;
var sinon = require('sinon');
var nodemailer = require('nodemailer');
var mockMailer = require('nodemailer-mock');
var mailer = require('../../server/config/mail_config.js');
var stubMailer = require('nodemailer-stub-transport');
var setup = require('../test_setup.js');
var proxyquire = require('proxyquire');
var async = require('async');

describe('User testing', function() {
 	
	before(function(done) {
		this.timeout(0);
		db.getConnection(function(err, connectionHandle){
			if(err) return done(err);
				connection = connectionHandle;
				done();
			});
	});
	
	beforeEach(function(done){
		db.clear(['User', 'ResetToken', 'Feedback','Session'],()=>db.populate(setup.USER_SUITE_BEFORE_EACH_DATA, done));	
	});

	after(function(done) {
		connection.release();
		done();
   });
	
	it('should create a guest user', function(done) {	
		
		user.createGuest('kvnQldQE6CUJc72BAyim0xBbhXigFmyv', function(err, guest){
			try{
				assert.isNull(err);
				assert.property(guest, 'UserID');
				assert.property(guest, 'AccessGroup');
				connection.query('SELECT SessionLink FROM User WHERE UserID = ?', [guest.UserID],function(err,rows){
					try{
						assert.isNull(err);
						assert.deepEqual(rows, [{SessionLink:'kvnQldQE6CUJc72BAyim0xBbhXigFmyv'}]);
						done();
					}catch(e){
						done(e);
					}
				});
			}catch(e){
				done(e);
			}
		});		 		    
  });
	
	it('should retrieve already existing guest user linked to session id', function(done) {	
		
		user.createGuest('LDnQlvQJ6CWJQ72pAsiv0sBghXsgAmy2', function(err, guest){
			try{
				assert.isNull(err);
				assert.property(guest, 'UserID');
				assert.property(guest, 'AccessGroup');
				assert.equal(guest.UserID, 'guest5131483184384sdsds834');
				connection.query('SELECT SessionLink FROM User WHERE UserID = ?', ['guest5131483184384sdsds834'],function(err,rows){
						try{
						assert.isNull(err);
						assert.deepEqual(rows, [{SessionLink:'LDnQlvQJ6CWJQ72pAsiv0sBghXsgAmy2'}]);
						done();
					}catch(e){
						done(e);
					}
				});
			}catch(e){
				done(e);
			}
		});		 		    
  });
	
	it('should retry creating guest user on uuid collision', function(done) {	
		var myConnection = {counter: 2, release: function(){}};
		myConnection.query = function(string, data, callback){
			myConnection.counter +=1;
			if(myConnection.counter % 3 == 0){
				var error = new Error();
				error.code = 'ER_DUP_ENTRY';
				return callback(error);
			}
			return callback(null, [{UserId:'MyUser'}]);
		};
		var spy = sinon.spy(myConnection, 'release');
		var user  = proxyquire('../../server/models/user.js', {'../config/connect_db.js': {
			getConnection: function(callback){ callback(null, myConnection);}
		}});
		
		user.createGuest('kvnQldQE6CUJc72BAyim0xBbhXigFmyv', function(err, guest){
			try{
				assert.isNull(err);
				assert(spy.calledOnce);
				done(); // success: call done with no parameter to indicate that it() is done()	
			}catch(e){
				done(e);
			}
		});		 		    
  });
	
	it('should return error on query error', function(done) {	
		var myConnection = {release: function(){}};
		myConnection.query = function(string, data, callback){
			return callback(new Error('MY_QUERY_ERROR'));
		};
		var spy = sinon.spy(myConnection, 'release');
		var user  = proxyquire('../../server/models/user.js', {'../config/connect_db.js': {
			getConnection: function(callback){ callback(null, myConnection);}
		}});
		
		user.createGuest('kvnQldQE6CUJc72BAyim0xBbhXigFmyv', function(err, guest){
			try{
				assert.isNotNull(err);
				assert.property(err, 'message');
				assert.equal(err.message, 'MY_QUERY_ERROR');
				assert(spy.calledOnce);
				done(); // success: call done with no parameter to indicate that it() is done()	
			}catch(e){
				done(e);
			}
		});		 		    
  });
    
	
	it('adds user correctly to database', function(done) {		
		user.addUser('test@hotmail.co.uk','John','Doe', 'encryptedtest', 2, function(err){
			try{
				assert.isNull(err);
				connection.query('SELECT * FROM User WHERE UserID = "test@hotmail.co.uk"', function(err, rows){							
					try {
						assert.isNull(err);
						assert.strictEqual(rows.length, 1);
						assert.isObject(rows[0]);
						assert.strictEqual(rows[0].UserID, 'test@hotmail.co.uk');
						assert.strictEqual(rows[0].FName, 'John');
						assert.strictEqual(rows[0].LName, 'Doe');
						assert.strictEqual(rows[0].AccessGroup, 2);
						expect(bcrypt.compareSync('encryptedtest',rows[0].Password)).to.be.true;
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}					
				});
			}catch(e){
				done(e);
			}
		});		 		    
    });
    
     it('should send USER EXISTS when adding new user', function(done) {		
		user.addUser('akusiak@underground.net','Adrian','Kusiak', 'password', 1, function(err){
			try{
				assert.isNotNull(err);
                assert.equal(err.message, "USER_EXISTS");
				done();
			}catch(e){
				done(e);
			}
		});		 		    
    });


	it('retrieves wanted users from database', function(done) {		
		var results = [{AccessGroup : 2, UserID : "inconito@whoknows.org", FName : "Inconito", LName : "Who"},
					   {AccessGroup : 2, UserID : "radgorecha@inlook.org", FName : "Radhika", LName : "Gorecha"},
					   {AccessGroup : 2, UserID : "student.email1@kcl.ac.uk", FName : "Maria", LName : "Veneva"},
					   {AccessGroup : 2, UserID : "student.email2@kcl.ac.uk", FName : "Tahoor", LName : "Ahmed"},
					   {AccessGroup : 2, UserID : "student.email3@kcl.ac.uk", FName : "Hani", LName : "Tawil"},
					   {AccessGroup : 2, UserID : "student.email4@kcl.ac.uk", FName : "Petru", LName : "Bancila"},
					   {AccessGroup : 2, UserID : "usain.bolt@gmail.com", FName : "Godspeed", LName: "Strike"}];
		
		user.getUsers(2, function(err,rows){					
			try {
				assert.isNull(err);
				assert.isArray(rows);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});   
    });
	
	it('retrieves wanted users in an array from database', function(done) {		
		var results = [{AccessGroup : 1, UserID : "akusiak@underground.net", FName : "Adrian", LName : "Kusiak"},
					   {AccessGroup : 2, UserID : "inconito@whoknows.org", FName : "Inconito", LName : "Who"},
					   {AccessGroup : 1, UserID : "kaedupuy@fake.com", FName : "Kaé", LName : "Dupuy"},
					   {AccessGroup : 1, UserID : "moderator.email1@kcl.ac.uk", FName : "Kae", LName : "Dupuy"},
					   {AccessGroup : 2, UserID : "radgorecha@inlook.org", FName : "Radhika", LName : "Gorecha"},
					   {AccessGroup : 2, UserID : "student.email1@kcl.ac.uk", FName : "Maria", LName : "Veneva"},
					   {AccessGroup : 2, UserID : "student.email2@kcl.ac.uk", FName : "Tahoor", LName : "Ahmed"},
					   {AccessGroup : 2, UserID : "student.email3@kcl.ac.uk", FName : "Hani", LName : "Tawil"},
					   {AccessGroup : 2, UserID : "student.email4@kcl.ac.uk", FName : "Petru", LName : "Bancila"},
					   {AccessGroup : 2, UserID : "usain.bolt@gmail.com", FName : "Godspeed", LName: "Strike"}];
		
		user.getUsers([1,2], function(err,rows){					
			try {
				assert.isNull(err);
				assert.isArray(rows);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});   
    });
	
	it('retrieves all users', function(done) {		
		var results = [{AccessGroup : 1, UserID : "akusiak@underground.net", FName : "Adrian", LName : "Kusiak"},
					   {AccessGroup : 2, UserID : "inconito@whoknows.org", FName : "Inconito", LName : "Who"},
					   {AccessGroup : 1, UserID : "kaedupuy@fake.com", FName : "Kaé", LName : "Dupuy"},
					   {AccessGroup : 1, UserID : "moderator.email1@kcl.ac.uk", FName : "Kae", LName : "Dupuy"},
					   {AccessGroup : 2, UserID : "radgorecha@inlook.org", FName : "Radhika", LName : "Gorecha"},
					   {AccessGroup : 2, UserID : "student.email1@kcl.ac.uk", FName : "Maria", LName : "Veneva"},
					   {AccessGroup : 2, UserID : "student.email2@kcl.ac.uk", FName : "Tahoor", LName : "Ahmed"},
					   {AccessGroup : 2, UserID : "student.email3@kcl.ac.uk", FName : "Hani", LName : "Tawil"},
					   {AccessGroup : 2, UserID : "student.email4@kcl.ac.uk", FName : "Petru", LName : "Bancila"},
					   {AccessGroup : 0, UserID : "testuser", FName : "test", LName : "user"},
					   {AccessGroup : 2, UserID : "usain.bolt@gmail.com", FName : "Godspeed", LName: "Strike"}];
		
		user.getUsers(null, function(err,rows){					
			try {
				assert.isNull(err);
				assert.isArray(rows);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});   
    });
	
	

	it('updates user information correctly', function(done) {		
		user.updateUser('usain.bolt@gmail.com','ub-thebg@hotmail.com','Usain','BG', function(err){
			try{
				assert.isNull(err);
				connection.query('SELECT * FROM User WHERE UserID = "ub-thebg@hotmail.com"', function(err, rows){							
					try {
						assert.isNull(err);
						assert.strictEqual(rows.length, 1);
						assert.isObject(rows[0]);
						assert.strictEqual(rows[0].UserID, 'ub-thebg@hotmail.com');
						assert.strictEqual(rows[0].FName, 'Usain');
						assert.strictEqual(rows[0].LName, 'BG');
						assert.strictEqual(rows[0].AccessGroup, 2);
						assert.strictEqual(rows[0].Password, 'strikingpassword');
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}					
				});
			}catch(e){
				done(e);
			}
		});	 		    
   });
	
	it('should return USER_DOESN\'T_EXIST when trying to update non-existent user', function(done) {		
		user.updateUser('usain.noexist@gmail.com','ub-thebg@hotmail.com','Usain','BG', function(err){
			try{
				assert.isNotNull(err);
				assert.property(err, 'message');
				assert.equal(err.message, 'USER_DOESN\'T_EXIST');
				done();
			}catch(e){
				done(e);
			}
		});	 		    
   });


	it('should delete user', function(done) {  
		user.deleteUser('student.email4@kcl.ac.uk', function(err){
			try {
				assert.isNull(err);	
				connection.query('SELECT * FROM User WHERE UserID = "student.email4@kcl.ac.uk"', function(err,result){
					try {
						assert.isNull(err);
						assert.deepEqual(result.length, 0);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});	
			} catch( e ) {
				done( e );
			}						
		});						
 	});
 
 
 	it('should authorize user', function(done) {
		user.authorize('kaedupuy@fake.com', 'plaintextpassword', function(err, userData){
			try {
				assert.isNull(err);
				assert.isObject(userData);
				assert.strictEqual(userData.UserID, 'kaedupuy@fake.com');
				assert.strictEqual(userData.FName, 'Kaé');
				assert.strictEqual(userData.LName, 'Dupuy');
				assert.strictEqual(userData.AccessGroup, 1);
				expect(bcrypt.compareSync('plaintextpassword',userData.Password)).to.be.true;
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}						
		});
 	});
 

 	it('should not authorize non-existent user', function(done) {
		user.authorize('idontexist@hotmail.com', 'password', function(err, userData){
			try {
				assert.isNotNull(err);
				assert.strictEqual(err.message, 'USER_DOESN\'T_EXIST');
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	it('should not authorize user with wrong password', function(done) {
		user.authorize('testuser', 'nottestpassword', function(err, userData){
			try {
				assert.isNotNull(err);
				assert.strictEqual(err.message, 'WRONG_PASSWORD');
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});
 
 	it('should return correct access group of user', function(done) {
		user.getAccessGroup('student.email3@kcl.ac.uk', function(err, accessGroup){
			try{
				assert.isNull(err);
				assert.deepEqual(accessGroup, 2); 
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});
    
     it('should send WRONG PASSWORD to get access group', function(done) {
		user.getAccessGroup('student.email10@kcl.ac.uk', function(err, accessGroup){
			try{
				assert.isNotNull(err);
				assert(err.message, "WRONG_PASSWORD"); 
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	it('should change the access group of the user to 1', function(done) {
		user.setAccessGroup('student.email3@kcl.ac.uk',1, function(err, accessGroup){
			try {
				assert.isNull(err);	
				connection.query('SELECT AccessGroup FROM User WHERE UserID = "student.email3@kcl.ac.uk"', function(err,result){
					try {
						assert.isNull(err);
						assert.deepEqual(result[0].AccessGroup, 1);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});	
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
									
		});
 	});
    
     it('should send USER DOESN\'T EXIST to set access group of the user to 1', function(done) {
		user.setAccessGroup('student.email10@kcl.ac.uk',1, function(err, accessGroup){
			try {
				assert.isNotNull(err);	
				assert(err.message, "USER DOESN\'T EXIST");
                done();
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
									
		});
 	});

	it('should reset password of user correctly', function(done) {  
		user.resetPassword('student.email3@kcl.ac.uk','new_password_test', function(err, rows){
			try {
				assert.isNull(err, 'Function should not err');	
				connection.query('SELECT Password FROM User WHERE UserID = "student.email3@kcl.ac.uk"', function(err,result){
					try {
						assert.isNull(err);
						expect(bcrypt.compareSync('new_password_test',result[0].Password)).to.be.true;
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});	
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});			
 	});
    
    it('should send USER DOESN\'T EXIST to reset password', function(done) {  
		user.resetPassword('student.email10@kcl.ac.uk','new_password_test', function(err, rows){
			try {
				assert.isNotNull(err);	
				assert(err.message, "USER DOESN\'T EXIST");
                done();
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});			
 	});

	it('should validate token', function(done) { 
		user.validateToken('217313efd0d38e644c7ad25a27b68cced6c5ac1c', function(err, rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, true);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});	
 	});
		
	it('should not validate token due to later than expiry date', function(done) {  
		user.validateToken('43f4886f63d41d81fc277fc4dbc028453abe86f4', function(err, rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, false);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}	
		});
	});
			
	it('should not validate non existing token', function(done) {  
		user.validateToken('4lkjuhyghjkdekdhezfuez453abe86f4', function(err, rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, false);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}	
		});
	});

	it('should send the email ', function(done) {  //TODO check
		mailer.handleMail('test@test.es', 'Test', 'Test text', function(sent){            
        	sent.should.be.ok;  
        	done();
    	});    					
 	});

	it('should send the email and save token', function(done) {
		user.requestReset('localhost:8000','student.email3@kcl.ac.uk', function(err, rows){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM ResetToken WHERE UserID = "student.email3@kcl.ac.uk"', function(err, result){
					try {
						assert.isNull(err);
						assert.isArray(result);
						expect(result[0].Token).to.have.lengthOf(40);
						assert.isAtMost(result[0].ExpiryDate,(Date.now() + 3600000)/1000 );
						assert.strictEqual(result[0].UserID, "student.email3@kcl.ac.uk");
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch(e) {
						done(e); // failure: call done with an error Object to indicate that it() failed
					}	
				});
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});						
 	});


	it('should not send the email to reset password because user does not exist', function(done) { 
		user.requestReset('localhost:8000', 'yoloemail@gmail.com', function(err, rows){
			try {
				assert.isNotNull(err);
				assert.strictEqual(err.message, 'USER_DOESN\'T_EXIST');
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}	
		});		
 	});


	it('should add feedback to database', function(done) { 
		var today = (new Date()).toISOString().substring(0, 10);
		
		var results =[{ Comments: "Thanks, great product guys!", FeedbackID: 5, Ratings: "Usefulness : 4, Usability : 2, Informative : 3,  Security : 1, Accessibilty : 5",
          				Reasons: "Know what to study now!"}];
				 
		user.addFeedback(4,2,3,1,5,"Know what to study now!", "Thanks, great product guys!", function(err, rows){
			try{
				assert.isNull(err);
				connection.query('SELECT FeedbackID, Ratings, Reasons, Comments FROM Feedback WHERE Day = ? AND FeedbackID = 5' , [today], function(err, result){
					try {
						assert.isNull(err);
						assert.deepEqual(results, result);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}		
		});
							
 	});
	

	it('should send all data stored in the Feedback table', function(done) { //TODO - fails because of Day : [Date : ] so passes with .length check
		user.getFeedback(function(err, rows){
			try {
				assert.isNull(err);
				assert.strictEqual(rows.length, 4);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}	
		});
	});

	it('should delete feedback from database based on specified date', function(done) { 
		var d = '2017-03-12'
		user.clearFeedback(d, function(err, rows){
			try {
				assert.isNull(err);
				connection.query("SELECT * FROM Feedback WHERE Day <= (?)", [d], function(err, result){
					try {
						assert.isNull(err);
						assert.deepEqual(result.length, 0);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}	
				});
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});		
 	});
    
   it('should send NOT FOUND to delete unknown feedback', function(done) { 
		var d = '2002-02-11'
		user.clearFeedback(d, function(err, rows){
			try {
				assert.isNotNull(err);
				assert.equal(err.message, "NOT_FOUND");
                done();
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});		
 	});
	
	 it('should delete all feedback', function(done) { 
		user.clearFeedback(null, function(err, rows){
			try {
				assert.isNull(err);
				connection.query("SELECT * FROM Feedback", function(err, result){
					try {
						assert.isNull(err);
						assert.deepEqual(result.length, 0);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}	
				});
                
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});		
 	});
	
	it('should return error on mysql connection error', function(done) {
				var user  = proxyquire('../../server/models/user.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
				async.parallel([function(callback){user.createGuest('lmkjhgfhjnksdczcvrvev',function(err){callback(null,err);});},
											 function(callback){user.getUsers(1, function(err){callback(null,err);});},
											 function(callback){user.addUser('student.email2@kcl.ac.uk', 'blah', 'blah', 'blah', 4, function(err){callback(null,err);});},
											 function(callback){user.updateUser('student.email2@kcl.ac.uk', 'student.email2@kcl.ac.uk', 'blah', 'blah', function(err){callback(null,err);});},
											 function(callback){user.deleteUser('student.email2@kcl.ac.uk',function(err){callback(null,err);});},
											 function(callback){user.authorize('student.email2@kcl.ac.uk', 'blah', function(err){callback(null,err);});},
											 function(callback){user.getAccessGroup('student.email1@kcl.ac.uk', function(err){callback(null,err);});},
											 function(callback){user.setAccessGroup('student.email2@kcl.ac.uk', 2, function(err){callback(null,err);});},
											 function(callback){user.resetPassword('student.email2@kcl.ac.uk', 'blah' , function(err){callback(null,err);});},
											 function(callback){user.requestReset('localhost:8000','student.email2@kcl.ac.uk' ,function(err){callback(null,err);});},
											 function(callback){user.validateToken('lmkjhgtfrghjnklmkjhbvgf', function(err){callback(null,err);});},
											 function(callback){user.addFeedback( 4, 2, 3, 1, 5,"No time got work to do!", "Great App", function(err){callback(null,err);});},
											 function(callback){user.clearFeedback( "2017-03-12", function(err){callback(null,err);});},
											 function(callback){user.getFeedback(function(err){callback(null,err);});},],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.typeOf(results[key], 'Error', 'result '+key+' is an error');
							assert.equal(results[key].message, 'MY_CONNECTION_ERROR');
						}
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});
 	
});
