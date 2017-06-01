var request = require('request');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var async = require('async');
var proxyquire = require('proxyquire');

describe('Server configuration', () => {
	afterEach(function(){
		process.env.NODE_ENV = 'test';	
	});
	
	it('should connect to database using production mode when specifying production NODE_ENV ', function(done) { 
		process.env.NODE_ENV = 'production';
		var sentOptions;
		
		var productionOptions = {
			host : 'localhost',
			user : 'root',
			password : '',
			database : 'module_selection',
			users_table : 'User'
		}
		var myConnection = {query:function(){},release(){}};
		var myPool = {getConnection: function(callback){callback(null, myConnection)}};
		var myDBConfig = proxyquire('../server/config/connect_db.js', {'mysql':{createPool:function(options){sentOptions = options;return myPool}}})	;
		var server = proxyquire('../app_server.js', {'./server/config/connect_db.js':myDBConfig, 'express-mysql-session': function(){return function(){}},
																								 'express-session': function(){return function(req,res,next){};},
																								 'express': function(){return {'use':function(){},'listen': function(port,cb){cb(null);} }},
																								 './server/routes.js': function(){}
																								});
		assert.deepEqual(sentOptions, productionOptions);	
		done();
 	 
	});
	
	
	
	
	
	it('should run database setup when specifying production NODE_ENV ', function(done) { 
		process.env.NODE_ENV = 'production';
		
		var myConnection = {query:function(first,second,third){if(third) third(null);else second(null);},release(){}};
		var myPool = {getConnection: function(callback){callback(null, myConnection)}};
		var myDummyConfig = {getConnection: function(callback){callback(null, myConnection)}};
		var myDBSetup = proxyquire('../database_setup.js', {'./server/config/connect_db.js':myDummyConfig});
		var myDBConfig = proxyquire('../server/config/connect_db.js', {'mysql':{createPool:function(options){sentOptions = options;return myPool}}, '../../database_setup.js':myDBSetup});
		
		var server = proxyquire('../app_server.js', {'./server/config/connect_db.js':myDBConfig, 'express-mysql-session': function(){return function(){}},
																								 'express-session': function(){return function(req,res,next){};},
																								 'express': function(){return {'use':function(){},'listen': function(port,cb){cb(null);} }},
																								 './server/routes.js': function(){}
																								});
		done();
 	 
	});

	it('should return error on mysql connection error in database setup ', function(done) { 
		var myDummyConfig = {getConnection: function(callback){callback(new Error('MYERROR'))}};
		var myDBSetup = proxyquire('../database_setup.js', {'./server/config/connect_db.js':myDummyConfig});
		myDBSetup.refresh(function(err){
			try{
				assert.isNotNull(err);
				done();
			}catch(e){done(e);}
		});
		
 	 
	});
	
	it('should return error on mysql connection error in connect_db.js', function(done) { 
		
		var db = proxyquire('../server/config/connect_db.js', {});
		db.getConnection(function(err){
			db.populate('', function(err2){
				db.clear('', function(err3){
					db.state.pool = {'getConnection': function(cb){cb(new Error('MYERROR'))}};
					db.clear('', function(err4){
					
							try{
								assert.isNotNull(err);
								assert.isNotNull(err2);
								assert.isNotNull(err3);
								assert.isNotNull(err4);
					
								done();
							}catch(e){done(e);}
					
					});
				});
			});
		});
	});
	
	it('should handle html email content if present', function(done) { 
		var expectedOptions = {
				from: 'moduleselectionnoreply@gmail.com', 
				to: 'blahaddress', 
				subject: 'Password Reset',
				html: 'MYHTML'
		};
		
		var setOptions;
		var mail = proxyquire('../server/config/mail_config.js', 
													{'nodemailer':{'createTransport':function(){return {'sendMail':function(mailOptions, callback){setOptions = mailOptions; callback(null, {info:''});}};}}});
		mail.handleMail('','MYHTML','blahaddress',function(err){
			try{
				assert.isNull(err);
				assert.deepEqual(setOptions, expectedOptions);
				done();
			}catch(e){done(e);}
			
		});
	});
	

	
});
