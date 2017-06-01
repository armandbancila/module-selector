var request = require('request');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var chaiHttp = require('chai-http');
var server = require('../app_server.js');
var modules = require('../server/models/modules.js');
var user = require("../server/models/user.js");
var db = require('../server/config/connect_db.js');
var setup = require('./test_setup.js');
var async = require('async');
var fs = require('fs');
var proxyquire = require('proxyquire');
chai.use(chaiHttp);

var cookie = 'connect.sid=s%3AkvnQldQE6CUJc72BAyim0xBbhXigFmyv.FXi%2FWTnAuTfZmRLswlS4ujtHYQCFZThDEdCTlH%2FQpHA; path=/; domain=localhost; HttpOnly; Expires=Tue Jan 19 2038 03:14:07 GMT+0000 (GMT);';

var userCookie = 'connect.sid=s%3ATIYc8UifRhwuRYl4q0ceiGHjokNXpr0v.FaovfMdMJYI%2B2PZdGK%2B3UadYYmGObTpdBiMnPEuY%2FwQ; path=/; domain=localhost; HttpOnly; Expires=Tue Jan 19 2038 03:14:07 GMT+0000 (GMT);'
var nonExistCookie = 'connect.sid=s%3AUACNeUCkYaZMKXo_GK0AnVKroY27aqIh.KmNWhfUQ4yRVh%2FhGySsU0LdkJrjQsQzcDkSyRDddPhI; path=/; domain=localhost; HttpOnly; Expires=Tue Jan 19 2038 03:14:07 GMT+0000 (GMT);'

/************************************************************Modules********************************************************/

describe('Module Routes', () => {
	
	before(function(done) {
		this.timeout(0);
		db.clear(['User','Session', 'Tag'],()=>db.populate(setup.MODULE_SUITE_BEFORE_DATA, done));
    });

	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Module', 'UserTracking'],()=>db.populate(setup.MODULE_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
	
  it('should send error 401', function(done) {
	chai.request(server)
	.post('/api/modules')
    .send({ 
		"moduleID": "6CCS2TMD",
		"moduleName" : "Test Module",
		"year" : 1,
		"credits" : 30,
		"lectureDay" : "Monday",
		"lectureTime" : 1200000,
		"description" : "Testing whether database saves test module correctly",
		"courseworkPercentage" : 10.2})
    .end(function(err, res){
		assert.isNotNull(err);
		assert.strictEqual(res.statusCode, 401);
		done();
 	 });
	});
	
	it('should send status 201 for uploading bulk data via insert', function(done) {
	chai.request(server)
	.post('/api/modules')
	.set('Cookie', cookie)
	.set('x-insert-type', 'BULK')
  .attach('batch', fs.readFileSync(__dirname+'/sampledata/samplemodules.csv'), 'samplemodules.csv')
  .end(function(err, res){
		assert.isNull(err);
		assert.strictEqual(res.statusCode, 201);
		done();
 	 });
	});
		
	it('should send status 201 for uploading bulk module data via load infile', function(done) {
	process.env.LOAD_LOCAL_INFILE = true;
	chai.request(server)
	.post('/api/modules')
	.set('Cookie', cookie)
	.set('x-insert-type', 'BULK')
	.attach('batch', fs.readFileSync(__dirname+'/sampledata/samplemodules.csv'), 'samplemodules.csv')
	.end(function(err, res){
		assert.isNull(err);
		assert.strictEqual(res.statusCode, 201);
		process.env.LOAD_LOCAL_INFILE =false;
		done();
		
 	 });
	});

	it('should send status 400 for trying to upload bulk data without file', function(done) {
		chai.request(server)
		.post('/api/modules')
		.set('Cookie', cookie)
		.set('x-insert-type', 'BULK')
		.end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
			assert.strictEqual(err.response.text, 'File not transfered');
			done();
		});
	});
	
	
	
	it('should send data for filtered modules', function(done) { 
		chai.request(server)
		.get('/api/modules?module_name=Operating Systems and Concurrency&year=2&time_range=090000:110000'+
				 '&day=Wednesday&coursework_percentage=15&credits=15&tag=BSc&faculty=Informatics&page=0&per_page=1') 
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.isObject(res);
			assert.deepEqual(res.body.data,  [{
                                                    CourseworkPercentage: 15,
                                                    Credits: 15,
                                                    Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION",
                                                    Faculty: "Informatics",
                                                    LectureDay: "Wednesday",
                                                    LectureTime: "10:00:00",
                                                    ModuleID: "5CCS2OSC",
                                                    Name: "Operating Systems and Concurrency",
                                                    Year: 2}]);
			done();
		
 	 });
	});
	
	it('should send status 400 for specifying non-weekday day filter', function(done) { 
		chai.request(server)
		.get('/api/modules?module_name=Operating Systems and Concurrency&year=2&time_range=090000:110000'+
				 '&day=Wednesday&coursework_percentage=15&credits=15&tag=BSc&faculty=Informatics&page=0&per_page=1&day=blah&day=monday') 
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
			assert.isObject(res);
			done();
		
 	 });
	});
	

	it('should send data for retrieving all modules', function(done) { 
		chai.request(server)
		.get('/api/modules')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.deepEqual(res.body.data,  
   [ { ModuleID: '4CCS1FC1',
       Name: 'Foundations of Computing 1',
       Description: 'FOUNDATIONS OF COMPUTING 1 DESCRIPTION',
       Year: 1,
       Credits: 15,
       LectureDay: 'Monday',
       LectureTime: '14:00:00',
       CourseworkPercentage: 0,
       Faculty: 'Informatics' },
     { ModuleID: '4CCS2DBS',
       Name: 'Database Systems',
       Description: 'DATABASE SYSTEMS DESCRIPTION',
       Year: 1,
       Credits: 15,
       LectureDay: 'Friday',
       LectureTime: '11:00:00',
       CourseworkPercentage: 20,
       Faculty: 'Informatics' },
     { ModuleID: '4SSMN110',
       Name: 'Economics',
       Description: 'ECONOMICS DESCRIPTION',
       Year: 1,
       Credits: 15,
       LectureDay: 'Tuesday',
       LectureTime: '13:00:00',
       CourseworkPercentage: 40,
       Faculty: 'Management' },
    {
        CourseworkPercentage: 0,
        Credits: 15,
        Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION",
        Faculty: "Informatics",
        LectureDay: "Wednesday",
        LectureTime: "14:00:00",
        ModuleID: "5CCS1FC2",
        Name: "Foundations of Computing 2",
        Year: 1},
     { ModuleID: '5CCS1INS',
       Name: 'Internet Systems',
       Description: 'INTERNET SYSTEMS DESCRIPTION',
       Year: 2,
       Credits: 15,
       LectureDay: 'Thursday',
       LectureTime: '13:00:00',
       CourseworkPercentage: 20,
       Faculty: 'Informatics' },
     {
       CourseworkPercentage: 15,
       Credits: 15,
       Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION",
       Faculty: "Informatics",
       LectureDay: "Wednesday",
       LectureTime: "10:00:00",
       ModuleID: "5CCS2OSC",
       Name: "Operating Systems and Concurrency",
       Year: 2},
     { ModuleID: '5CCS2SEG',
       Name: 'Software Engineering Group Project',
       Description: 'SOFTWARE ENGINEERING DESCRIPTION',
       Year: 2,
       Credits: 30,
       LectureDay: 'Monday',
       LectureTime: '12:00:00',
       CourseworkPercentage: 85,
       Faculty: 'Informatics' },
     { ModuleID: '5SSMN210',
       Name: 'Accounting',
       Description: 'ACCOUNTING DESCRIPTION',
       Year: 2,
       Credits: 15,
       LectureDay: 'Friday',
       LectureTime: '09:00:00',
       CourseworkPercentage: 20,
       Faculty: 'Management' },
    {
       CourseworkPercentage: 20,
       Credits: 15,
       Description: "AERODYNAMICS DESCRIPTION",
       Faculty: "Mathematics",
       LectureDay: "Friday",
       LectureTime: "09:00:00",
       ModuleID: "7CCS2KLM",
       Name: "Aerodynamics",
       Year: 2},
    {
       CourseworkPercentage: 40,
       Credits: 15,
       Description: "Blah",
       Faculty: "Management",
       LectureDay: "Thursday",
       LectureTime: "13:00:00",
       ModuleID: "7CCS2TDL",
       Name: "Todelete",
       Year: 1} ]);
			done();
 	 });
	});

	it('should send 404 for retrieving unknown module', function(done) { 
		chai.request(server)
		.get('/api/modules/5CCSBYT')
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 404);
			done();
 	 });
	});
	
	it('should send retrieved tags assigned to modules specified', function(done) { 
		chai.request(server)
		.get('/api/modules/tags?module=5CCS2SEG&module=5CCS2OSC')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.deepEqual(res.body, [ { TagName: 'BSc', Category: "NULL" }]);
			done();
 	 });
	});
    
    it('should send empty response for tags assigned to module that doesn\'t exist', function(done) { //TODO start tests for 500
		chai.request(server)
		.get('/api/modules/tags?module=FAKEMODULE')
    .end(function(err, res){
			assert.isNull(err);
			expect(res.body).to.be.empty;
			done();
 	 });
	});

	it('should send data for retrieving modules by faculty', function(done) { 
		chai.request(server)
		.get('/api/modules/faculties')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [ { Faculty: 'Informatics' },
  																 { Faculty: 'Management' },
																	 { Faculty: 'Mathematics' } ]);
			done();
 	 });
	});

	it('should send 204 for updating module information', function(done) { 
		chai.request(server)
		.put('/api/modules/7CCS2KLM')
		.set('Cookie', cookie)
		.send({"moduleID":"7CCS2KLM", "moduleName":"Aerodynamics", "description":"AERODYNAMICS DESCRIPTION", "year":2, 
            "credits":15, "lectureDay":"Friday", "lectureTime":"09:00:00", "courseworkPercentage":20, "faculty":"Mathematics"})
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 204);
			done();
 	 });
	});

	it('should send 404 for updating module information', function(done) { 
		chai.request(server)
		.put('/api/modules/8CCS2BHB')
		.set('Cookie', cookie)
		.send({ "moduleID" : "6CCS1MAL", "moduleName" : 'Matrix Algebra',  "description" : 'The study of matrices in depth',
						"year" : 3, "credits" : 70, "lectureDay" : 'Friday', "lectureTime" :'15:00:00',
					  "courseworkPercentage" : 25 , "faculty" : 'Mathematics'})
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode,404);
			done();
 	 });
	});

		it("should send data for retrieving correct module", function(done) {  
			chai.request(server)
		  .get('/api/modules/4CCS1FC1')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body, [ { "CourseworkPercentage": 0,
                                                "Credits": 15,
                                                "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION",
                                                "Faculty": "Informatics",
                                                "LectureDay": "Monday",
                                                "LectureTime": "14:00:00",
                                                "ModuleID": "4CCS1FC1",
                                                "Name": "Foundations of Computing 1",
                                                "Year": 1
                                            } ] );
                done();   
	    });  
	 });
	
		it('should send status 201 for adding a module', function(done) { 
  		chai.request(server)
		  .post('/api/modules')
		  .set('Cookie', cookie)
		  .send({ 
				"moduleID": "6CCS2TMD",
				"moduleName" : "Test Module",
				"description" : "Testing whether database saves test module correctly",
				"year" : 1,
				"credits" : 30,
				"lectureDay" : "Monday",
				"lectureTime" : "120000",
				"courseworkPercentage" : 100, 
				"faculty" : "Test Faculty"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});

	
		it('should send status 409 for adding a duplicate module', function(done) { 
  		chai.request(server)
		  .post('/api/modules')
			.set('Cookie', cookie)
		  .send({ 
				"moduleID": "5CCS2SEG",
				"moduleName" : "Test Module",
				"description" : "Testing whether test passes or not",
				"year" : 1,
				"credits" : 30,
				"lectureDay" : "Monday",
				"lectureTime" : "120000",
				"courseworkPercentage" : 100, 
				"faculty" : "Test Faculty"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    });
	});
        
        it('should send status 400 for adding a moduleID too long', function(done) { 
  		chai.request(server)
		  .post('/api/modules')
			.set('Cookie', cookie)
		  .send({ 
				"moduleID": "testtoolongtestestestestestestest",
				"moduleName" : "Test Module",
				"description" : "Testing whether database saves test module correctly",
				"year" : 1,
				"credits" : 30,
				"lectureDay" : "Monday",
				"lectureTime" : 120000,
				"courseworkPercentage" : 100, 
				"faculty" : "Test Faculty"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
		    done();
    });
	});


	it("expects status code 204 for deleting by moduleID", function(done) {  
			chai.request(server)
		  .delete('/api/modules/7CCS2TDL')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 }); 

	it("expects status code 404 for deleting an unknown module", function(done) {
			chai.request(server)
		  .delete('/api/modules/3CCS2FOC')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
	
	
	it('should return status 500 on mysql connection error', function(done) {
		server.close();
				var modules = proxyquire('../server/models/modules.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
  			var tags = proxyquire('../server/models/tags.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
				var routeSetup = proxyquire('../server/routes.js', {'./models/modules.js': modules, './models/tags.js': tags});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				async.parallel([function(callback){chai.request(server).get('/api/modules/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/modules/tags').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/modules/faculties').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/modules').set('Cookie', cookie).send({"moduleID": "6CCS2TMD","moduleName" : "name",
																																	"description" : "description", "year" : 1,"credits" : 30,"lectureDay" : "Monday","lectureTime" : "120000",
																																	"courseworkPercentage" : 100,"faculty" : "Test Faculty"})
																																.end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/modules').set('Cookie', cookie).set('x-insert-type', 'BULK')
  																														 .attach('batch', fs.readFileSync(__dirname+'/sampledata/samplemodules.csv'), 'samplemodules.csv')
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).put('/api/modules/module').set('Cookie', cookie).send({"moduleID": "6CCS2TMD","moduleName" : "name",
																																	"description" : "description", "year" : 1,"credits" : 30,"lectureDay" : "Monday","lectureTime" : "120000",
																																	"courseworkPercentage" : 100,"faculty" : "Test Faculty"})
																																.end(function(err,resp){callback(null,{error:err, res:resp});});},
											  function(callback){chai.request(server).get('/api/modules?module_name=Operating Systems and Concurrency&year=2&time_range=090000:110000'+
				 '&day=Wednesday&coursework_percentage=15&credits=15&tag=BSc&faculty=Informatics&page=0&per_page=1').end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/modules/moduleID').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).get('/api/modules/moduleID').end(function(err,resp){callback(null,{error:err, res:resp});});}],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.property(results[key], 'error', 'result '+key+' has error');
							assert.property(results[key], 'res', 'result '+key+' has response');
							assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
							assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
						}
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});

});

	
	/***************************************************************User****************************************************************/
describe('User Routes', () => {

	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['User', 'ResetToken', 'Session'],()=>db.populate(setup.USER_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
	
	it("expects status 204 to delete a user", function(done) {  
			chai.request(server)
		  .delete('/api/users/mariav@mar.s')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 }); 
 
  it("expects status 404 for trying to delete a user without being authenticated as the user or an Admin", function(done) {  
			chai.request(server)
		  .delete('/api/users/mariav@mar.s')
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 401);
		    done();    
	    });  
	 });   
	
    it('should send status 200 and data for getting users', function(done) { 
		chai.request(server)
		.get('/api/users')
		.set('Cookie',cookie)
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [
                                    {UserID: "akusiak@underground.net", FName: "Adrian", LName: "Kusiak", AccessGroup : 1},
                                    {UserID: "inconito@whoknows.org", FName: "Inconito", LName: "Who", AccessGroup: 2},
                                    {UserID: "kaedupuy@fake.com", FName: "Kaé", LName: "Dupuy", AccessGroup: 1},
                                    {UserID: "moderator.email1@kcl.ac.uk", FName: "Kae", LName: "Dupuy", AccessGroup : 1},
                                    {UserID: "radgorecha@inlook.org", FName: "Radhika", LName: "Gorecha", AccessGroup: 2},
                                    {UserID: "student.email1@kcl.ac.uk", FName: "Maria", LName: "Veneva", AccessGroup: 2},
                                    {UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", AccessGroup: 2},
                                    {UserID: "student.email3@kcl.ac.uk", FName: "Hani", LName: "Tawil", AccessGroup: 2},
                                    {UserID: "student.email4@kcl.ac.uk", FName: "Petru", LName: "Bancila", AccessGroup: 2},
                                    {UserID: "testuser", FName: "test", LName: "user", AccessGroup: 0},
                                    {UserID: "usain.bolt@gmail.com", FName: "Godspeed", LName: "Strike", AccessGroup: 2}]);
			done();
 	 });
	});
    
	 it('should send status 200 and data with users with multiple specified access groups', function(done) { 
		chai.request(server)
		.get('/api/users?access_group=0&access_group=1')
		.set('Cookie',cookie)
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [
                                    {UserID: "akusiak@underground.net", FName: "Adrian", LName: "Kusiak", AccessGroup : 1},
                                    {UserID: "kaedupuy@fake.com", FName: "Kaé", LName: "Dupuy", AccessGroup: 1},
                                    {UserID: "moderator.email1@kcl.ac.uk", FName: "Kae", LName: "Dupuy", AccessGroup : 1},
                                    {UserID: "testuser", FName: "test", LName: "user", AccessGroup: 0}]);
			done();
 	 });
	});
	
	it('should send status 200 and data with users with specified access group', function(done) { 
		chai.request(server)
		.get('/api/users?access_group=0')
		.set('Cookie',cookie)
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [
                                    {UserID: "testuser", FName: "test", LName: "user", AccessGroup: 0}]);
			done();
 	 });
	});
	
    it('should send status 201 for adding a user', function(done) { 

  		chai.request(server)
		  .post('/api/users')
		  .send({ 
				"userID": "testuser.test@kcl.ac.uk",
				"fName" : "Test User in Test",
				"lName" : "routes.js",
				"password" : "passwordtest"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});
    
    it('should send status 409 for adding a duplicate user', function(done) {

  		chai.request(server)
		  .post('/api/users')
		  .send({ 
				"userID": 'akusiak@underground.net', 
                "fName": 'Adrian', 
                "lName": 'Kusiak',
				"password" : "password"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    });
	});
    
    it('should send status 200 for updating a user', function(done) {
		chai.request(server)
		.put('/api/users/student.email2@kcl.ac.uk')
		.set('Cookie', userCookie)
    .send({ 
				"userID": "student.email2@kcl.ac.uk",
				"fName" : "Bob",
				"lName" : "Bolt"})
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			done();
 	 });
	});
	
	it('should return status 500 on mysql connection error', function(done) {
		server.close();
			var users = proxyquire('../server/models/user.js', {'../config/connect_db.js': {
				getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
			}});


			var routeSetup = proxyquire('../server/routes.js', {'./models/user.js': users});
			server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
			async.parallel([function(callback){chai.request(server).get('/api/users').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).post('/api/users').set('Cookie', userCookie).send({ "userID": "testuser.test@kcl.ac.uk","fName" : "Test User in Test",
																																																									"lName" : "routes.js","password" : "passwordtest"})
																															.end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).put('/api/users/student.email2@kcl.ac.uk').set('Cookie', userCookie)
																															.send({ "userID": "testuser.test@kcl.ac.uk","fName" : "Test User in Test",
																																			"lName" : "routes.js","password" : "passwordtest"})
																															.end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).delete('/api/users/studentuser').set('Cookie', cookie)
																															.end(function(err,resp){callback(null,{error:err, res:resp});});}],
			function(err, results){
				try {
					for(var key in results) {
						assert.isNotNull(results[key], 'result '+key+' is not null');
						assert.property(results[key], 'error', 'result '+key+' has error');
						assert.property(results[key], 'res', 'result '+key+' has response');
						assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
						assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
					}
					done();
				} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
 	});
	
    
}); 
		
	/*******************************************************************Tracked Modules**************************************************/	

describe('Tracked Modules Routes', () => {
	
	before(function(done) {
		this.timeout(0);
		db.clear(['Tag','User','Session'],()=>db.populate(setup.MODULE_SUITE_BEFORE_DATA, done));
    });

	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Module','UserTracking'],()=>db.populate(setup.MODULE_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
	
	it('expects data to be returned from getting tracked modules', function(done) { 
		chai.request(server)
		.get('/api/users/student.email1@kcl.ac.uk/modules/')
		.set('Cookie', cookie)
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.isObject(res);
            assert.deepEqual(res.body.data,  [{
                                                    CourseworkPercentage: 15,
                                                    Credits: 15,
                                                    Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION",
                                                    Faculty: "Informatics",
                                                    LectureDay: "Wednesday",
                                                    LectureTime: "10:00:00",
                                                    ModuleID: "5CCS2OSC",
                                                    Name: "Operating Systems and Concurrency",
                                                    Year: 2}]);
			done();
 	 });
	});

	it('expects data returned to be filtered from getting tracked modules', function(done) { 
		chai.request(server)
		.get('/api/users/student.email1@kcl.ac.uk/modules?module_name=Operating Systems and Concurrency&year=2&time_range=090000:110000&day=Wednesday&coursework_percentage=15&credits=15&tag=BSc&faculty=Informatics&per_page=1&page=0') 
		.set('Cookie', cookie)
		.end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.isObject(res);
            assert.deepEqual(res.body.data,  [{
                                                    CourseworkPercentage: 15,
                                                    Credits: 15,
                                                    Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION",
                                                    Faculty: "Informatics",
                                                    LectureDay: "Wednesday",
                                                    LectureTime: "10:00:00",
                                                    ModuleID: "5CCS2OSC",
                                                    Name: "Operating Systems and Concurrency",
                                                    Year: 2}]);
			done();
 	 });
	});



	it('expects status 201 to add to tracked modules', function(done) { 
		chai.request(server)
		.post('/api/users/modules/')
		.set('Cookie', userCookie)
    .send({
			moduleID: '5CCS2SEG',
			userID: 'student.email2@kcl.ac.uk'})
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
			done();
 	 });
	});
	
	it('expects status 201 to add to tracked modules with array search', function(done) { 
		chai.request(server)
		.post('/api/users/modules/')
		.set('Cookie', userCookie)
    .send({
			moduleID: '5CCS2SEG',
			userID: 'student.email2@kcl.ac.uk', 
			tagArray : ['BSc', 'Year 1']})
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
			done();
 	 });
	});
	
	it('expects status 400 for trying to register tracked module by specifying single tag string instead of array', function(done) { 
		chai.request(server)
		.post('/api/users/modules/')
		.set('Cookie', userCookie)
    .send({
			moduleID: '5CCS2SEG',
			userID: 'student.email2@kcl.ac.uk', 
			tagArray : 'BSc'})
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
			done();
 	 });
	});

	it('expects status 409 to add a duplicate module to tracked modules', function(done) { 
		chai.request(server)
		.post('/api/users/modules/')
		.set('Cookie', userCookie)
    .send({
			moduleID: '5CCS2OSC',
			userID: 'student.email2@kcl.ac.uk'})
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
			done();
 	 });
	});

	it('should send status 204 for removing a module from tracking', function(done) { 
			chai.request(server)
		  .delete('/api/users/student.email2@kcl.ac.uk/modules/5CCS2OSC')
			.set('Cookie', userCookie)
		  	.end(function(err, res){
					assert.isNull(err);
					assert.strictEqual(res.statusCode, 204);
				  done();    
			});  
	 }); 
    
    it('should send status 404 for removing unknown module from tracking', function(done) { 
			chai.request(server)
		  .delete('/api/users/student.email2@kcl.ac.uk/modules/FAKEMOD')
			.set('Cookie', userCookie)
		  	.end(function(err, res){
					assert.isNotNull(err);
					assert.strictEqual(res.statusCode, 404);
				  done();    
			});  
	 });
	
		

		it("expects data to get recommendations", function(done) {
				chai.request(server)
				.get('/api/users/student.email1@kcl.ac.uk/modules/recommended?tag=Business Intelligence Manager&wanted=1')
				.end(function(err, res){
					assert.isNull(err);
					assert.strictEqual(res.statusCode, 200);
					assert.deepEqual(res.body, [{ ModuleID: '5SSMN210',
																			Name: 'Accounting',
																			Description: 'ACCOUNTING DESCRIPTION',
																			Year: 2,
																			Credits: 15,
																			LectureDay: 'Friday',
																			LectureTime: '09:00:00',
																			CourseworkPercentage: 20,
																			Faculty: 'Management',
																			Rank: 3 }]);
					done();    
				});  
		 });
	
		it('should return status 500 on mysql connection error', function(done) {
		server.close();
				var modules = proxyquire('../server/models/modules.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
  			var tags = proxyquire('../server/models/tags.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
				var routeSetup = proxyquire('../server/routes.js', {'./models/modules.js': modules, './models/tags.js': tags});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				async.parallel([function(callback){chai.request(server).get('/api/users/userID/modules/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/users/userID/modules/recommended').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/users/modules/').set('Cookie', userCookie).send({moduleID: '5CCS2OSC',userID: 'student.email2@kcl.ac.uk'})
    																														.end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/users/student.email1@kcl.ac.uk/modules?module_name=Operating Systems and Concurrency'+
																																		'&year=2&time_range=090000:110000&day=Wednesday&coursework_percentage=15&credits=15'+
																																		'&tag=BSc&faculty=Informatics&per_page=1&page=0').end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/users/student.email2@kcl.ac.uk/modules/moduleID').set('Cookie', userCookie).end(function(err,resp){callback(null,{error:err, res:resp});});}],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.property(results[key], 'error', 'result '+key+' has error');
							assert.property(results[key], 'res', 'result '+key+' has response');
							assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
							assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
						}
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});

});
	
	
	/*************************************************************Tags****************************************************************/
	
describe('Tag Routes', () => {
	
	before(function(done) {
		this.timeout(0);
		db.clear(['Module'],()=>db.populate(setup.TAG_SUITE_BEFORE_DATA, done));
    });

	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Tag', 'ModuleTag','User', 'Session'],()=>db.populate(setup.TAG_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});

	it('should send status 201 for creating a tag', function(done) { 
  		chai.request(server)
		  .post('/api/tags')
			.set('Cookie', cookie)
		  .send({ 
				tagName: "Test tag",
				catgory: "testCategory"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    	});
	});
    
    it('should send status 409 for creating a duplicate tag', function(done) { 
  		chai.request(server)
		  .post('/api/tags')
			.set('Cookie', cookie)
		  .send({ 
				tagName: "Internet",
				catgory: "Careers"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    	});
	});
	
	it('should send status 201 for creating tags by bulk upload', function(done) { 	
		chai.request(server)
		  .post('/api/tags')
		  .set('Cookie', cookie)
		  .set("x-insert-type", "BULK")
			.attach('batch', fs.readFileSync(__dirname+'/sampledata/sampletags.csv'), 'sampletags.csv')
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    	});
	});
	
	it('should send status 400 for not sending file with BULK tag insert request', function(done) { 
  		chai.request(server)
		  .post('/api/tags')
		  .set('Cookie', cookie)
		  .set("x-insert-type", "BULK")
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
				assert.strictEqual(err.response.text, 'File not transfered');
				done();
    	});
	});
	
	it('should send status 201 for creating tags by bulk upload using LOAD LOCAL', function(done) { 
  		process.env.LOAD_LOCAL_INFILE = true;
			chai.request(server)
		  .post('/api/tags')
		  .set('Cookie', cookie)
		  .set("x-insert-type", "BULK")
			.attach('batch', fs.readFileSync(__dirname+'/sampledata/sampletags.csv'), 'sampletags.csv')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
		    process.env.LOAD_LOCAL_INFILE = false;
				done();
  			
				
    	});
	});
    
    it('should send status 204 for updating a Tag', function(done) { 
  		chai.request(server)
		  .put('/api/tags/MSc')
			.set('Cookie', cookie)
		  .send({ 
				"tagName" : "MSc",
				"category" : "Degree"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 204);
		    done();
    });
	});
    
    it('should send status 404 for updating unknown Tag', function(done) { 
  		chai.request(server)
		  .put('/api/tags/TESTTAG')
			.set('Cookie', cookie)
		  .send({ 
				"tagName" : "testag",
				"category" : "test"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 404);
		    done();
    });
	});
	
	it("should send status 204 for deleting by tagName", function(done) {  
			chai.request(server)
		  .delete('/api/tags/DeleteTag')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
    
    it("should send status 404 for deleting unknown tagName", function(done) {
			chai.request(server)
		  .delete('/api/tags/sendNotFoundTag')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err); 
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
	 
	 it('should send unauthorized 401 for creating a tag', function(done) { 
  		chai.request(server)
		  .post('/api/tags')
		  .send({ 
				"tagName" : "Test tag"})
		  .end(function(err, res){	
			assert.isNotNull(err);
		  assert.strictEqual(res.statusCode, 401);
		    done();
    });
	});
	
	 it('should send 201 for assigning tags in bulk', function(done) { 
		 chai.request(server)
		  .post('/api/modules/tags')
		  .set('Cookie',cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampleassignmentstags.csv'), 'sampleassignmentstags.csv')
		  .end(function(err, res){	
			assert.isNull(err);
		  assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});
	
	it('should send status 400 for not sending file with BULK tag assignment insert request', function(done) { 
  		chai.request(server)
		  .post('/api/modules/tags')
		  .set('Cookie', cookie)
		  .set("x-insert-type", "BULK")
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
				assert.strictEqual(err.response.text, 'File not transfered');
				done();
    	});
	});
	
	 it('should send 201 for assigning tags in bulk using LOAD LOCAL', function(done) { //TODO
  	process.env.LOAD_LOCAL_INFILE = true;
		 chai.request(server)
		  .post('/api/modules/tags')
		  .set('Cookie',cookie)
		  .set('x-insert-type', 'BULK')
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampleassignmentstags.csv'), 'sampleassignmentstags.csv')
		  .end(function(err, res){	
			assert.isNull(err);
		  assert.strictEqual(res.statusCode, 201);
		   process.env.LOAD_LOCAL_INFILE = false;	 
			 done();
			 
    });
	});
	
	it('should send status 201 for assigning a tag to module', function(done) { 
  		chai.request(server)
		  .post('/api/modules/5CCS2SEG/tags')
			.set('Cookie', cookie)
		  .send({ 
				"tagName" : "BSc"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});
	
	it('should send status 404 for assigning a tag that doesn\'t exist', function(done) { 
  		chai.request(server)
		  .post('/api/modules/5CCS2SEG/tags')
			.set('Cookie', cookie)
		  .send({ 
				"tagName" : "Idontexist"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 404);
		    done();
    });
	});
    
    it('should send status 409 for assigning a duplicate tag to module', function(done) { 
  		chai.request(server)
		  .post('/api/modules/5CCS2SEG/tags')
			.set('Cookie', cookie)
		  .send({ 
				"tagName" : "Software Engineer"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    });
	});
		
	
	it("should send status 204 for unassigning a tag from module", function(done) {  
			chai.request(server)
		  .delete('/api/modules/5CCS2OSC/tags/Software Engineer')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
    
    it("should send status 404 for unassigning unknown tag from module", function(done) {  
			chai.request(server)
		  .delete('/api/modules/5CCS2OSC/tags/imnotassigned')
			.set('Cookie', cookie)
		  .send({ 
				"tagName": "Unknown",
				"moduleID" : "5CCS2TST"})
		  .end(function(err, res){
				assert.isNotNull(err); 
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
    
    it('should send status 200 for getting tags', function(done) { 
		chai.request(server)
		.get('/api/tags')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body,[ {"Category": "Careers", "TagName": "Astrology"},{"Category": null, "TagName": "BSc"},
                                        {"Category": "Degree", "TagName": "BSc Computer Science"},
                                        {"Category": "Degree", "TagName": "BSc Computer Science with Management"},
                                        {"Category": "Careers", "TagName": "Business Intelligence Manager"},
                                        {"Category": "Skills", "TagName": "Communication"},
                                        {"Category": "Careers", "TagName": "Data Architect"},
                                        {"Category": null, "TagName": "DeleteTag" },
                                        {"Category": "Careers", "TagName": "Internet"},
                                        {"Category": "Skills", "TagName": "Maths"},
                                        {"Category": null, "TagName": "MSc"},
                                        {"Category": "Degree", "TagName": "MSci Computer Science"},
                                        {"Category": "Careers", "TagName": "Physicist"},
                                        {"Category": "Careers", "TagName": "Software Engineer"},
                                        {"Category": "Careers", "TagName": "System Analyst"},
                                        {"Category": null, "TagName": "Year 1"},
                                        {"Category": null, "TagName": "Year 2"},
                                        {"Category": null, "TagName": "Year 3"}] );
			done();
 	 });
	});
    
    it('should send status 200 and data for getting tags assigned to a module', function(done) { 
		chai.request(server)
		.get('/api/modules/5CCS2OSC/tags')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [ { TagName: 'Software Engineer', Category: 'Careers' } ]);
			done();
 	 });
	});
    
    it('should send status 200 and data for getting categories', function(done) { 
		chai.request(server)
		.get('/api/tags/categories')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [ { Category: 'Careers'} , {Category: 'Degree' },
  																	 { Category: 'Skills' } ]);
			done();
 	 });
	});
	
	it('should return status 500 on mysql connection error', function(done) {
		server.close();
  			var tags = proxyquire('../server/models/tags.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
				var routeSetup = proxyquire('../server/routes.js', {'./models/tags.js': tags});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				async.parallel([function(callback){chai.request(server).get('/api/tags/categories/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/tags/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/modules/moduleid/tags/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).put('/api/tags/TESTTAG').set('Cookie', cookie).send({ "tagName" : "testag","category" : "test"})
																															 	.end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/modules/tags').set('Cookie',cookie).attach('batch', fs.readFileSync(__dirname+'/sampledata/sampleassignmentstags.csv'), 'sampleassignmentstags.csv')
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/tags').set('Cookie',cookie).set('x-insert-type', 'BULK').attach('batch', fs.readFileSync(__dirname+'/sampledata/sampleassignmentstags.csv'), 'sampleassignmentstags.csv')
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/tags').set('Cookie', cookie).send({ tagName: "Test tag",catgory: "testCategory"})
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).post('/api/modules/5CCS2SEG/tags').set('Cookie', cookie).send({ "tagName" : "BSc"})
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/modules/moduleid/tags/tagid').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/tags/tagid').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});}],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.property(results[key], 'error', 'result '+key+' has error');
							assert.property(results[key], 'res', 'result '+key+' has response');
							assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
							assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500: ' + results[key].error.response.text);
						}
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});

});
    /***********************************************DEGREES****************************************************/
    
describe('Degree routes', () => {
	
	before(function(done) {
		this.timeout(0);
		db.clear(['User', 'Module'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_DATA, done));	
			
    });
		
	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Degree', 'DegreeBuild', 'User', 'Session'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
    
    it('should send status 200 and data for getting matched degrees', function(done) { 
		chai.request(server)
		.get('/api/users/student.email2@kcl.ac.uk/degrees')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [ { DegreeTitle: 'BSc Computer Science' },
																	 { DegreeTitle: 'BEng Computer Science with Engineering' },
																	 { DegreeTitle: 'BSc Computer Science with Management' },
																	 { DegreeTitle: 'BSc Mathematics with Finance' },
																	 { DegreeTitle: 'MSci Computer Science' }]);
			done();
 	 });
	});
    
    it('should send status 200 for returning a degree', function(done) { 
		chai.request(server)
		.get('/api/degrees/BSc Computer Science')
    .end(function(err, res){	
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [ { DegreeTitle: 'BSc Computer Science', LengthOfStudy: 3 } ]);
			done();
 	 });
	});
    
    it('should send status 200 for getting all degrees', function(done) {  
		chai.request(server)
		.get('/api/degrees')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [{ DegreeTitle: 'BEng Computer Science with Engineering', LengthOfStudy: 3 },
																	{ DegreeTitle: 'BSc Computer Science', LengthOfStudy: 3 },
																	{ DegreeTitle: 'BSc Computer Science with Management', LengthOfStudy: 3 }, 
																	{ DegreeTitle: 'BSc Mathematics with Finance', LengthOfStudy: 3 },
																	{ DegreeTitle: 'MSci Computer Science', LengthOfStudy: 4 } ]);
			done();
 	 });
	});
    
    it('should send status 201 for adding a degree', function(done) { 
  		chai.request(server)
		  .post('/api/degrees')
			.set('Cookie', cookie)
		  .send({ 
				"degreeTitle" : "BSc Computer Science with a Year in Industry",
				"lengthOfStudy" : "4"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});
    
    it('should send status 409 for adding a duplicate degree', function(done) { 
  		chai.request(server)
		  .post('/api/degrees')
			.set('Cookie', cookie)
		  .send({ 
				"degreeTitle" : "BSc Computer Science",
				"lengthOfStudy" : 3})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    });
	});

		it('should send status 400 for trying to bulk upload degrees without sending file', function(done) { 
  		chai.request(server)
		  .post('/api/degrees')
		  .set('Cookie', cookie)
		  .set('x-insert-type', 'BULK')
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
		    done();
    });
	});
	
	it('should send status 400 for trying to bulk upload a degree without specifying insert type to BULK', function(done) { 
  		chai.request(server)
		  .post('/api/degrees')
		  .set('Cookie', cookie)
			.attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
		    done();
    });
	});
	
	 it('should send status 201 for adding a degree by bulk upload', function(done) { 
  		chai.request(server)
		  .post('/api/degrees')
		  .set('Cookie', cookie)
		  .set('x-insert-type', 'BULK')
			.attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    done();
    });
	});
	
	 it('should send status 201 for adding a degree by bulk upload using LOAD LOCAL', function(done) { 
		 process.env.LOAD_LOCAL_INFILE = true;
  		chai.request(server)
		  .post('/api/degrees')
		  .set('Cookie', cookie)
		  .set('x-insert-type', 'BULK')
			.attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		    process.env.LOAD_LOCAL_INFILE = false;
				done();
    });
	});

		it('should send status 404 for updating an unknown degree', function(done) { 
  		chai.request(server)
		  .put('/api/degrees/BSc Computer Science with Geology')
			.set('Cookie', cookie)
		  .send({ 
				"degreeTitle" : "BSc Computer Science with a Year in Industry",
				"lengthOfStudy" : "4"})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 404);
		    done();
    });
	});

		it('should send status 204 for updating a degree', function(done) { 
  		chai.request(server)
		  .put('/api/degrees/BSc Mathematics with Finance')
			.set('Cookie', cookie)
		  .send({ 
				"degreeTitle" : "BSc Mathematics with Finance",
				"lengthOfStudy" : "2"})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 204);
		    done();
    });
	});
    
    it("should send status 204 for deleting degree", function(done) { 
			chai.request(server)
		  .delete('/api/degrees/MSci Computer Science')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
    
    it("should send status 404 for deleting unknown degree", function(done) {  
			chai.request(server)
		  .delete('/api/degrees/Blah Degree')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err); 
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 }); 
    
    it('should send status 200 for getting assignments to degree', function(done) { 
		chai.request(server)
		.get('/api/degrees/BSc Computer Science with Management/modules/')
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,200);
			assert.isObject(res);
			assert.deepEqual(res.body, [{
                                            "CourseworkPercentage": 0,
                                            "Credits": 15,
                                            "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION",
                                            "Faculty": "Informatics",
                                            "IsOptional": 0,
                                            "LectureDay": "Monday",
                                            "LectureTime": "14:00:00",
                                            "ModuleID": "4CCS1FC1",
                                            "Name": "Foundations of Computing 1",
                                            "Year": 1
                                            },
                                            {
                                            "CourseworkPercentage": 40,
                                            "Credits": 15,
                                            "Description": "ECONOMICS DESCRIPTION",
                                            "Faculty": "Management",
                                            "IsOptional": 1,
                                            "LectureDay": "Tuesday",
                                            "LectureTime": "13:00:00",
                                            "ModuleID": "4SSMN110",
                                            "Name": "Economics",
                                            "Year": 1
                                            },
                                            {
                                            "CourseworkPercentage": 20,
                                            "Credits": 15,
                                            "Description": "INTERNET SYSTEMS DESCRIPTION",
                                            "Faculty": "Informatics",
                                            "IsOptional": 0,
                                            "LectureDay": "Thursday",
                                            "LectureTime": "13:00:00",
                                            "ModuleID": "5CCS1INS",
                                            "Name": "Internet Systems",
                                            "Year": 2
                                            },
                                            {
                                            "CourseworkPercentage": 85,
                                            "Credits": 30,
                                            "Description": "SOFTWARE ENGINEERING DESCRIPTION",
                                            "Faculty": "Informatics",
                                            "IsOptional": 1,
                                            "LectureDay": "Monday",
                                            "LectureTime": "12:00:00",
                                            "ModuleID": "5CCS2SEG",
                                            "Name": "Software Engineering Group Project",
                                            "Year": 2
                                            },
                                            {
                                            "CourseworkPercentage": 20,
                                            "Credits": 15,
                                            "Description": "ACCOUNTING DESCRIPTION",
                                            "Faculty": "Management",
                                            "IsOptional": 1,
                                            "LectureDay": "Friday",
                                            "LectureTime": "09:00:00",
                                            "ModuleID": "5SSMN210",
                                            "Name": "Internet Systems",
                                            "Year": 2
                                            }]);
			done();
 	 });
	});
    
    it('should send status 201 for adding assignment to degree', function(done) { 
  		chai.request(server)
		  .post('/api/degrees/MSci Computer Science/modules')
			.set('Cookie', cookie)
		  .send({
				"moduleID" : "4CCS2DBS",
                "isOptional" : 0})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		   done();
    });
	});
	
	it('should send status 400 for trying to add assignments to degrees in bulk without sending file', function(done) {
  		chai.request(server)
		  .post('/api/degrees/modules')
			.set('Cookie', cookie)
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
		   done();
    });
	});
	
	
	it('should send status 201 for adding assignments to degrees in bulk', function(done) { 
  		chai.request(server)
		  .post('/api/degrees/modules')
			.set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesassignments.csv'), 'sampledegreesassignments.csv')
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
		   done();
    });
	});
	
	  it('should send status 201 for adding assignments to degrees in bulk using LOAD LOCAL', function(done) { 
			process.env.LOAD_LOCAL_INFILE = true;
  		chai.request(server)
		  .post('/api/degrees/modules')
			.set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesassignments.csv'), 'sampledegreesassignments.csv')
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 201);
				process.env.LOAD_LOCAL_INFILE=false;
		   done();
    });
	});
    
    it('should send status 409 for adding duplicate assignment to degree', function(done) {
  		chai.request(server)
		  .post('/api/degrees/BSc Computer Science/modules')
			.set('Cookie', cookie)	
		  .send({ 
				"moduleID" : "4CCS1FC1",
                "isOptional" : 0})
		  .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 409);
		    done();
    });
	});
    
    it('should send status 204 for updating an assignment', function(done) { 
		chai.request(server)
		.put('/api/degrees/BSc Computer Science with Management/modules/5SSMN210')
    .set('Cookie', cookie)
    .send({ "isOptional" : false})
    .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode,204);
			done();
 	 });
	});
    
    it('should send status 404 for updating unknown assignment', function(done) { 
		chai.request(server)
		.put('/api/degrees/BSc Computer Science with Management with unknown/modules/5SSMN210')
    .set('Cookie', cookie)
    .send({ "isOptional" : false})
    .end(function(err, res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode,404);
			done();
 	 });
	});

		it("should send status 204 for unassigning a module from degree", function(done) { 
			chai.request(server)
		  .delete('/api/degrees/BSc Computer Science with Management/modules/5CCS2SEG')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
        
        it("should send status 404 for unassigning unknown module from degree", function(done) { 
			chai.request(server)
		  .delete('/api/degrees/BSc unknown/modules/5CCS2UNKNOWN')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });


			/***********************************************Degree Dependencies***********************************************************/    
			
    it("should send data for retrieving dependencies", function(done) { 
			chai.request(server)
		  .get('/api/degrees/BSc Computer Science/modules/dependencies')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body, [ { DegreeID: 'BSc Computer Science',
																			 Dependency: '6CCS1MAL',
																		 	 Parent: '4CCS1FC1' },
																		 { DegreeID: 'BSc Computer Science',
																			 Dependency: '5CCS1INS',
																			 Parent: '4CCS2DBS' },
																		 { DegreeID: 'BSc Computer Science',
																			 Dependency: '5CCS2SEG',
																			 Parent: '4CCS2DBS' } ]);
			done();    
	    });  
	 });
	
	 it("should send status 201 for adding dependencies", function(done) { 
		chai.request(server)
		  .post('/api/degrees/MSci Computer Science/modules/dependencies') 
		  .set('Cookie', cookie)
		  .send({ "moduleID": "5CCS2SEG" ,
				  "dependentID" :  "4CCS2DBS" })
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
			done();    
	    });  
	 });
	
	 it("should send status 404 for trying to add faulty dependencies", function(done) { 
		chai.request(server)
		  .post('/api/degrees/MSci Computer Science/modules/dependencies') 
		  .set('Cookie', cookie)
		  .send({ "moduleID": "5CCS2SOJU" ,
				  "dependentID" :  "4CCS2DQX" })
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
			done();    
	    });  
	 });
	
	it("should send status 400 trying to add dependencies in bulk without sending file", function(done) { 
		chai.request(server)
		  .post('/api/degrees/modules/dependencies') 
		  .set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
			done();    
	    });  
	 });
	
	it("should send status 201 adding dependencies in bulk", function(done) { 
		chai.request(server)
		  .post('/api/degrees/modules/dependencies') 
		  .set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesdependencies.csv'), 'sampledegreesdependencies.csv')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
			done();    
	    });  
	 });
	
	it("should send status 201 adding dependencies in bulk using LOAD LOCAL", function(done) { 
		process.env.LOAD_LOCAL_INFILE =true;
		chai.request(server)
		  .post('/api/degrees/modules/dependencies') 
		  .set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesdependencies.csv'), 'sampledegreesdependencies.csv')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
				process.env.LOAD_LOCAL_INFILE= false;
				done();    
	    });  
	 });
	

	it("should send status 204 for updating dependencies", function(done) {  
		chai.request(server)
		  .put('/api/degrees/BSc Computer Science/modules/4CCS1FC1/dependencies')
			.set('Cookie', cookie)
			.send({ "dependentIDArray" :  ["5CCS2SEG"] })
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });

	/*********************************************************Degree Building*************************************************/
	
	it("should send status 201 for creating a degree build", function(done) { 
			chai.request(server)
		  .post('/api/users/builds/')
			.set('Cookie', userCookie)
			.send({ "degreeTitle" :  "BSc Computer Science with Management", 
					"userID" : "student.email2@kcl.ac.uk" })
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
				expect('Location', '/api/users/builds/');
		    done();    
	    });  
	 });
	
		it("should send status 400 for creating a degree build with a non-string user ID provided", function(done) { 
			chai.request(server)
		  .post('/api/users/builds/')
			.set('Cookie', userCookie)
			.send({ "degreeTitle" :  "BSc Computer Science with Management", 
					"userID" : [{'bla':'Im an object wrapped string'}] })
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
		    done();    
	    });  
	 });

	it("should send data for retrieving all degree build", function(done) {
			chai.request(server)
		  .get('/api/users/student.email2@kcl.ac.uk/builds')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body,      [
        {
          "buildID": 1,
          "components": [
            {ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics", Evaluated : "Normal"},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "DATABASE SYSTEMS DESCRIPTION","Evaluated": "DEPENDENCY", "Faculty": "Informatics",
              "LectureDay": "Friday","LectureTime": "11:00:00","ModuleID": "4CCS2DBS","Name": "Database Systems","Year": 1},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "INTERNET SYSTEMS DESCRIPTION","Evaluated": "DEPENDENT","Faculty": "Informatics",
              "LectureDay": "Thursday","LectureTime": "13:00:00","ModuleID": "5CCS1INS","Name": "Internet Systems","Year": 2},
            {"CourseworkPercentage": 0,"Credits": 15,"Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION","Evaluated": "Compulsory","Faculty": "Informatics","LectureDay": "Monday","LectureTime": "14:00:00","ModuleID": "4CCS1FC1","Name": "Foundations of Computing 1","Year": 1},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "DATABASE SYSTEMS DESCRIPTION","Evaluated": "Compulsory","Faculty": "Informatics",
              "LectureDay": "Friday","LectureTime": "11:00:00","ModuleID": "4CCS2DBS","Name": "Database Systems","Year": 1}
          ],
          "recommended": [
            {
              "DueTo": "4CCS1FC1",
              "Recommendation": "6CCS1MAL"
            },
            {
              "DueTo": "4CCS1FC1",
              "Recommendation": "6CCS1MAL"
            }
          ],
          "template": "BSc Computer Science"
        },
        {
          "buildID": 2,
          "components": [
            {ModuleID:"5CCS1INS", Name:"Internet Systems", Description:"INTERNET SYSTEMS DESCRIPTION", Year:2, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:20, Faculty:"Informatics", Evaluated : "Compulsory"},
            {"CourseworkPercentage": 25,"Credits": 70,"Description": "MATRIX ALGEBRA DESCRIPTION","Evaluated": "Compulsory","Faculty": "Mathematics",
              "LectureDay": "Thursday","LectureTime": "15:00:00","ModuleID": "6CCS1MAL","Name": "Matrix Algebra","Year": 3}
          ],
          "recommended": [],
          "template": "MSci Computer Science"
        }
      ]);
		    done();    
	    });  
	 });

	it("should send data for retrieving a degree build", function(done) { 
			chai.request(server)
		  .get('/api/users/builds/1')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body, {"buildID": "1",
        "components": [
            {ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15,      LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics", Evaluated : "Normal"},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "DATABASE SYSTEMS DESCRIPTION","Evaluated": "DEPENDENCY", "Faculty": "Informatics",
              "LectureDay": "Friday","LectureTime": "11:00:00","ModuleID": "4CCS2DBS","Name": "Database Systems","Year": 1},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "INTERNET SYSTEMS DESCRIPTION","Evaluated": "DEPENDENT","Faculty": "Informatics",
              "LectureDay": "Thursday","LectureTime": "13:00:00","ModuleID": "5CCS1INS","Name": "Internet Systems","Year": 2},
            {"CourseworkPercentage": 0,"Credits": 15,"Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION","Evaluated": "Compulsory","Faculty": "Informatics","LectureDay": "Monday","LectureTime": "14:00:00","ModuleID": "4CCS1FC1","Name": "Foundations of Computing 1","Year": 1},
            {"CourseworkPercentage": 20,"Credits": 15,"Description": "DATABASE SYSTEMS DESCRIPTION","Evaluated": "Compulsory","Faculty": "Informatics",
              "LectureDay": "Friday","LectureTime": "11:00:00","ModuleID": "4CCS2DBS","Name": "Database Systems","Year": 1}
        ],
        "recommended": [
          {
            "DueTo": "4CCS1FC1",
            "Recommendation": "6CCS1MAL"
          },
          {
            "DueTo": "4CCS1FC1",
            "Recommendation": "6CCS1MAL"
          }
        ],
        "template": "BSc Computer Science"});
		    done();    
	    });  
	 });
	
	it("should send 404 for retrieving non-existent degree build", function(done) { 
			chai.request(server)
		  .get('/api/users/builds/3')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });

		it("should send status 201 for adding to a degree build", function(done) { 
			chai.request(server)
		  .put('/api/users/builds/2/modules')
			.set('Cookie', userCookie)
			.send({"moduleID" : "6CCS1MAL"})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
		    done();    
	    });  
	 });
	
	it("should send status 404 for adding to a non existent degree build", function(done) { 
			chai.request(server)
		  .put('/api/users/builds/10/modules')
			.set('Cookie', userCookie)
			.send({"moduleID" : "6CCS1MAL"})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
	
		it("should send status 404 for adding a non existent module to a degree build", function(done) { 
			chai.request(server)
		  .put('/api/users/builds/2/modules')
			.set('Cookie', userCookie)
			.send({"moduleID" : "idontexist"})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });

		it("should send status 204 for deleting a module from a degree build", function(done) { 
			chai.request(server)
		  .delete('/api/users/builds/1/modules/4CCS1FC1')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
	
		it("should send status 401 for trying to delete a module from a degree build when not authorised as the owner", function(done) { 
			chai.request(server)
		  .delete('/api/users/builds/1/modules/4CCS1FC1')
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 401);
		    done();    
	    });  
	 });
        
     it("should send status 404 for removing unknown module from a degree build", function(done) { 
			chai.request(server)
		  .delete('/api/users/builds/2/modules/4CCS1FC2')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });

		it("should send status 204 for deleting a degree build", function(done) {
			chai.request(server)
		  .delete('/api/users/builds/1')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
        
    it("should send status 404 for deleting unknown degree build", function(done) { 
			chai.request(server)
		  .delete('/api/users/builds/10')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
	
	/*********************************************************Degree Recommendations************************************************/
	
	 it("should send status 200 and data for getting degree recommendations", function(done) { 
		chai.request(server)
		  .get('/api/degrees/BSc Computer Science/modules/recommendations')
			.set('Cookie', userCookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body, [ {  DegreeID: 'BSc Computer Science',
												ModuleID: '4CCS1FC1',
												Recommendation: '6CCS1MAL' },
											  { DegreeID: 'BSc Computer Science',
												ModuleID: '5CCS2SEG',
												Recommendation: '4CCS2DBS' } ]);
		    done();    
	    });  
	 });
	
	 it("should send status 201 for adding degree recommendations", function(done) {
		chai.request(server)
		  .post('/api/degrees/MSci Computer Science/modules/recommendations')
		  .set('Cookie', cookie)
		  .send({ "moduleID" : "5CCS1INS",
				  "recommendedID" : "5CCS2SEG"})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
		    done();    
	    });  
	 });
	
	 it("should send status 404 for adding degree recommendations to an unknown degree", function(done) { 
		chai.request(server)
		  .post('/api/degrees/BSc Computer Science with Skiing/modules/recommendations')
		  .set('Cookie', cookie)
		  .send({ "moduleID" : "FAKE",
				  "recommendedID" : "6CCS1MAL"})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();    
	    });  
	 });
	

		it("should send status 400 for trying to add degree recommendations by bulk upload without sending file", function(done) { 
		chai.request(server)
		  .post('/api/degrees/modules/recommendations')
		  .set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
		    done();    
	    });  
	 });
	
	 it("should send status 201 for adding degree recommendations by bulk upload", function(done) { 
		chai.request(server)
		  .post('/api/degrees/modules/recommendations')
		  .set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesrecommendations.csv'), 'sampledegreesrecommendations.csv')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
		    done();    
	    });  
	 });
	
	it("should send status 201 for adding degree recommendations by bulk upload using LOAD LOCAL", function(done) { 
		process.env.LOAD_LOCAL_INFILE = true;
		chai.request(server)
		  .post('/api/degrees/modules/recommendations')
		  .set('Cookie', cookie)
		  .attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegreesrecommendations.csv'), 'sampledegreesrecommendations.csv')
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 201);
		    process.env.LOAD_LOCAL_INFILE= false;
				done();    
	    });  
	 });
	
	it("should send status 204 for updating degree recommendations", function(done) { 
		chai.request(server)
		  .put('/api/degrees/BSc Computer Science/modules/5CCS2SEG/recommendations')
		  .set('Cookie', cookie)
		  .send({ "recommendedIDArray" : ["5SSMN210", "6CCS1MAL"]})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();    
	    });  
	 });
	
	
	it('should return status 500 on mysql connection error', function(done) {
		server.close();
  			var degrees = proxyquire('../server/models/degrees.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
		
				var routeSetup = proxyquire('../server/routes.js', {'./models/degrees.js': degrees});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				async.parallel([function(callback){chai.request(server).get('/api/users/user/degrees').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/users/user/builds').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/users/builds/build').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/degrees/degreeTitle').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/degrees/degrename/modules').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/degrees/degrename/modules/dependencies').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/degrees/degrename/modules/recommendations').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).get('/api/degrees/').end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/degrees').set('Cookie', cookie).send({ "degreeTitle" : "BigTitle","lengthOfStudy" : "4"})
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).put('/api/degrees/bigTitle').set('Cookie', cookie).send({ "degreeTitle" : "BigTitle","lengthOfStudy" : "4"})
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/degrees').set('Cookie', cookie).set('x-insert-type', 'BULK').attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/degrees/modules').set('Cookie', cookie).attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},		
												function(callback){chai.request(server).post('/api/degrees/modules/dependencies').set('Cookie', cookie).attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},		
												function(callback){chai.request(server).post('/api/degrees/modules/recommendations').set('Cookie', cookie).attach('batch', fs.readFileSync(__dirname+'/sampledata/sampledegrees.csv'), 'sampledegrees.csv')
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},		
												function(callback){chai.request(server).post('/api/degrees/MSci Computer Science/modules').set('Cookie', cookie).send({"moduleID" : "4CCS2DBS","isOptional" : 0})
		  																													.end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).put('/api/degrees/BSc Computer Science/modules/4CCS1FC1/dependencies').set('Cookie', cookie).send({ "dependentIDArray" :  ["5CCS2SEG"] })
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).post('/api/degrees/MSci Computer Science/modules/dependencies').set('Cookie', cookie).send({ "moduleID": "5CCS2SEG" ,"dependentID" :  "4CCS2DBS" })
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).put('/api/degrees/MSci Computer Science/modules/moduleid/dependencies').set('Cookie', cookie)
																															 .send({ "moduleID": "5CCS2SEG" ,"dependentIDArray" :  ["4CCS2DBS"] })
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).post('/api/degrees/MSci Computer Science/modules/recommendations').set('Cookie', cookie).send({ "moduleID": "5CCS2SEG" ,"recommendedID" :  "4CCS2DBS" })
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).put('/api/degrees/MSci Computer Science/modules/moduleid/recommendations').set('Cookie', cookie)
																															 .send({ "moduleID": "5CCS2SEG" ,"recommendedIDArray" :  ["4CCS2DBS"] })
																															 .end(function(err,resp){callback(null,{error:err, res:resp});});},	
												function(callback){chai.request(server).put('/api/degrees/MSci Computer Science/modules/moduleID').set('Cookie', cookie).send({"isOptional" : 0})
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},
												function(callback){chai.request(server).post('/api/users/builds/').set('Cookie', userCookie).send({ "degreeTitle" :  "degreetitle", "userID" : "student.email2@kcl.ac.uk" })
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},													
		  									function(callback){chai.request(server).put('/api/users/builds/2/modules').set('Cookie', userCookie).send({"moduleID" : "4CCF2KLM"})									
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},													
											 	function(callback){chai.request(server).delete('/api/users/builds/1/modules/module').set('Cookie', userCookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/users/builds/1').set('Cookie', userCookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/degrees/degreetitle').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/degrees/degreetitle/modules/moduleid').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});}],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.property(results[key], 'error', 'result '+key+' has error');
							assert.property(results[key], 'res', 'result '+key+' has response');
							assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
							assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500: ' + results[key].error.response.text);
						}
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});
	
	
	it('should return status 500 on mysql query error after user verified as build owner', function(done) {
		server.close();
  			
				var myConnection = {counter: 0, release: function(){}};
				myConnection.query = function(string, data, callback){
					myConnection.counter +=1;
					if(myConnection.counter % 2 == 0){
						var error = new Error();
						error.code = 'MY_ERROR_CODE';
						return callback(error);
					}
					return callback(null, [{Owner:'student.email2@kcl.ac.uk'}]);
				};
				var spy = sinon.spy(myConnection, 'release');

		
				var degrees = proxyquire('../server/models/degrees.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(null, myConnection);}
				}});
		
				var routeSetup = proxyquire('../server/routes.js', {'./models/degrees.js': degrees});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				async.parallel([function(callback){chai.request(server).put('/api/users/builds/1/modules').set('Cookie', userCookie).send({"moduleID" : "4CCF2KLM"})									
		  																												 .end(function(err,resp){callback(null,{error:err, res:resp});});},													
											 	function(callback){chai.request(server).delete('/api/users/builds/1/modules/module').set('Cookie', userCookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											 	function(callback){chai.request(server).delete('/api/users/builds/1').set('Cookie', userCookie).end(function(err,resp){callback(null,{error:err, res:resp});});}],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.property(results[key], 'error', 'result '+key+' has error');
							assert.property(results[key], 'res', 'result '+key+' has response');
							assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
							assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500: ' + results[key].error.response.text);
						}
						assert.equal(spy.callCount,6); 
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});
	
    
});

  /*************************************************************Authentication***********************************************/

describe('Authentication routes', () => {
		
	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['User', 'Session'],()=>db.populate(setup.AUTH_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
	
	var userID = 'testAuthentication@gmail.co.uk';

	it('expects status 200 to login ', function(done) {
			chai.request(server)
		  .post('/login')
		  .send({ 
				userID: 'kaedupuy@fake.com',
        password: 'plaintextpassword'})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
		    done();
		     
 		 });
  });
	
	it('expects status 200 to login with remember option', function(done) {
			chai.request(server)
		  .post('/login')
		  .send({ 
				userID: 'kaedupuy@fake.com',
        password: 'plaintextpassword',
				remember: true})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
		    done();
		     
 		 });
  });

	it('expects status 401 when trying to login with non-existent user ', function(done) {
			chai.request(server)
		  .post('/login')
		  .send({ 
				userID: 'not@authorised.com',
        password: 'no'})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 401);
		    done();
		     
 		 });
  });

	it('expects status 401 when trying to login with wrong password', function(done) {
			chai.request(server)
		  .post('/login')
		  .send({ 
				userID: 'kaedupuy@fake.com',
        password: 'no'})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 401);
		    done();
		     
 		 });
  });

	
  it('expects status 200 to save new user', function(done) {
			chai.request(server)
		  .post('/signup')
		  .send({
				userID: 'testAuthentication@gmail.co.uk',
                password: 'integration' ,
				fName : 'testint',
				lName : 'blah'
			})
		  .end(function(err, res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
		    done();
 		 });     
  });


  it('expects 401 duplicate email', function(done) { 
	chai.request(server)
	.post('/signup')
	.send({ userID: 'kaedupuy@fake.com',
        	password: 'password',
		    fName : 'testint',
			lName : 'blah'})
	.end(function(err, res){
		assert.isNotNull(err);
		assert.strictEqual(res.statusCode, 401);
		done();
 	});
  });

	it('expects 400 if password not specified', function(done) {
		chai.request(server)
       	.post('/signup')
       	.send({
        password: 'integration'})
		.end(function(err,res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 400);
			done();
 		 });
  });

  it('expects bad request if email not specified', function(done) {
	chai.request(server)
	.post('/signup')
    .send({ userID: userID,
      })
	.end(function(err,res){
		assert.isNotNull(err);
		assert.strictEqual(res.statusCode, 400);
		done();
  		});
	});

	it('expects to send back null as not authenticated', function(done) {
		chai.request(server)
		.get('/logged_in')
		.end(function(err,res){
			assert.isNull(err);
			assert.strictEqual(res.body.FName, null);
		 	assert.strictEqual(res.body.LName, null);
			assert.strictEqual(res.body.AccessGroup, 2);
			assert.isString(res.body.UserID);
			done();
  		});
	});

	it('expects to send back user as authenticated', function(done) {
		chai.request(server)
		.get('/logged_in')
		.set('Cookie', cookie)
		.end(function(err,res){
			assert.isNull(err);
			assert.deepEqual(res.body, { UserID: 'testuser',
										FName: 'test',
										LName: 'user',
										AccessGroup: 0 } );
			done();
  		});
	});

	it('expects to send status code 401 as user does not exist', function(done) {  
		chai.request(server)
		.post('/login')
		.send({	"userID" : "notexist@user.com",
				"password" : "pass"	})
		.end(function(err,res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 401);
			done();
  		});
	});

	it('expects to send the users access group', function(done) {
		chai.request(server)
		.get('/has_permissions/2')
		.set('Cookie', cookie)
		.end(function(err,res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			assert.deepEqual(res.body, { UserID: 'testuser',
										 FName: 'test',
		 								 LName: 'user',
										 AccessGroup: 0 });
			done();
  		});
	});

	it('expects to send nothing as not a user', function(done) { 
		chai.request(server)
		.get('/has_permissions/0')
		.end(function(err,res){
			assert.isNull(err);
			assert.deepEqual(res.body, {});
			done();
  		});
	});

	it('expects status 200 to reset password of user', function(done) {
		chai.request(server)
		.post('/reset_password')
		.set('Cookie', userCookie)
		.send({ "userID" : "student.email2@kcl.ac.uk",
			   "password" : "newpassword",
			   "token" : "43f4886f63d41d81fc277fc4dbc028453abe86f4" })
		.end(function(err,res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			done();
  		});
	});
		
	it('expects status 401 to reset password of user with bad token', function(done) {
		chai.request(server)
		.post('/reset_password')
		.set('Cookie', userCookie)
		.send({ "userID" : "student.email2@kcl.ac.uk",
			   "password" : "newpassword",
			   "token" : "43f4886f63d41d81f28453abe86f4" })
		.end(function(err,res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 401);
			done();
  		});
	});
	
	it('expects status 200 to change password of user', function(done) { 
		chai.request(server)
		.post('/change_password')
		.set('Cookie', userCookie)
		.send({ "userID" : "student.email2@kcl.ac.uk",
				"password" : "newpassword"})
		.end(function(err,res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 200);
			done();
  		});
	});
	
	it('expects status 401 to change password of unknown', function(done) { 
		chai.request(server)
		.post('/change_password')
		.set('Cookie', userCookie)
		.send({ "userID" : "hi@kcl.ac.uk",
				"password" : "newpassword"})
		.end(function(err,res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 401);
			done();
  		});
	});

	it('expects status 204 to change access group of user', function(done) {  
		chai.request(server)
		.put('/reset_access_group')
		.set('Cookie', cookie)
		.send({ "userID" : "student.email2@kcl.ac.uk",
				"accessGroup" : "1"})
		.end(function(err,res){
			assert.isNull(err);
			assert.strictEqual(res.statusCode, 204);
			done();
  		});
	});
		
	it('expects status 404 to change password of unknown user', function(done) { 
		chai.request(server)
		.put('/reset_access_group')
		.set('Cookie', cookie)
		.send({ "userID" : "doesntexist@gmail.co.uk",
				"accessGroup" : "1"})
		.end(function(err,res){
			assert.isNotNull(err);
			assert.strictEqual(res.statusCode, 404);
			done();
  		});
	});

		it('expects status 200 to request reset of password of user', function(done) { 
			chai.request(server)
			.post('/request_reset')
			.set('Cookie', cookie)
			.send({ "userID" : "kaedupuy@fake.com"})
			.end(function(err,res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				done();
  			});
		});

		it('expects status 401 to request reset of password of unknown user', function(done) { 
			chai.request(server)
			.post('/request_reset')
			.set('Cookie', cookie)
			.send({ "userID" : "doesntexist@gmail.co.uk"})
			.end(function(err,res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 401);
				done();
  			});
		});

	it('should logout user', function(done) { 
		chai.request(server)
		.get('/logout')
		.end(function(err, res){
			assert.isNull(err);
			expect('Location', '/');
			assert.strictEqual(res.statusCode, 200);
		    done();
		});
	});
	
	it('should return status 500 on mysql connection error', function(done) {
		server.close();
			var users = proxyquire('../server/models/user.js', {'../config/connect_db.js': {
				getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
			}});


			var routeSetup = proxyquire('../server/routes.js', {'./models/user.js': users});
			server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
			async.parallel([function(callback){chai.request(server).post('/request_reset').set('Cookie', cookie).send({ "userID" : "kaedupuy@fake.com"})
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).get('/logged_in').end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).get('/logged_in').set('Cookie', nonExistCookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).put('/reset_access_group').set('Cookie', cookie).send({ "userID" : "student.email2@kcl.ac.uk","accessGroup" : "1"})
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).post('/reset_password').set('Cookie', userCookie).send({ "userID" : "student.email2@kcl.ac.uk","password" : "newpassword",
																																																																					  "token" : "463d1d81fc277fc4dbc028453abe86f4" })
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).post('/change_password').set('Cookie', userCookie).send({ "userID" : "student.email2@kcl.ac.uk","password" : "newpassword"})
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});}],
			function(err, results){
				try {
					for(var key in results) {
						assert.isNotNull(results[key], 'result '+key+' is not null');
						assert.property(results[key], 'error', 'result '+key+' has error');
						assert.property(results[key], 'res', 'result '+key+' has response');
						assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
						assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
					}
					done();
				} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
 	});
	
		
	it('should return status 500 on mysql connection error in passport scripts', function(done) {
		server.close();
			
			proxyquire.noCallThru();
			proxyquire.noPreserveCache();
				
			var users = proxyquire('../server/models/user.js', {'../config/connect_db.js': {
				getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
			}});
			
			var passportConf = proxyquire('../server/config/passport.js', {'../models/user.js': users});
			var passport = proxyquire('passport', {});
			passportConf(passport);
			server = proxyquire('../app_server.js',{ './server/config/passport.js':passportConf,'passport':passport});
		
			async.series([function(callback){chai.request(server).post('/login').set('Cookie', cookie).send({	"userID" : "notexist@user.com","password" : "pass"	})
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).post('/signup').set('Cookie', cookie).send({"userID" : "notexist@live.co.uk","fName": "awd","lName": "dwa","password" : "pass142452"	})
																														 .end(function(err,resp){callback(null,{error:err, res:resp});});}],
			function(err, results){
				try {
					for(var key in results) {
						assert.isNotNull(results[key], 'result '+key+' is not null');
						assert.property(results[key], 'error', 'result '+key+' has error');
						assert.property(results[key], 'res', 'result '+key+' has response');
						assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
						assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
					}
					done();
				} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
 	});
	
	
	it('should return status 500 on mysql connection error in passport deserialisation', function(done) {
		server.close();
			var passport = proxyquire('passport', {});
			proxyquire.noCallThru();
			proxyquire.noPreserveCache();
			var passportSetup = proxyquire('../server/config/passport.js', {
																																		 './connect_db.js':{getConnection:function(cb){cb(new Error('MYERROR'));}}});
			
			passportSetup(passport);
			server = proxyquire('../app_server.js',{'./server/config/passport.js': function(){}, 'passport':passport});
			chai.request(server).get('/api/users/').set('Cookie', cookie).send({ "userID" : "kaedupuy@fake.com"})
																														 .end(function(err,resp){	
					try {
						assert.isNotNull(err);
						assert.equal(resp.statusCode, 500, 'status from result is not 500: ' + err.response.text);
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
			
			});
			
 	});
	
	
	it('should return status 500 on mysql query error after user validated token', function(done) {
		server.close();		
				var myConnection = {counter: 0, release: function(){}};
				myConnection.query = function(string, data, callback){
					myConnection.counter +=1;
					if(myConnection.counter % 2 == 0){
						var error = new Error();
						error.code = 'MY_ERROR_CODE';
						return callback(error);
					}
					return callback(null, [{ExpiryDate: (Date.now()+30000)/1000, UserID:'student.email2@kcl.ac.uk', Token:"43f4886f63d41d81fc277fc4dbc028453abe86f4"}]);
				};
				var spy = sinon.spy(myConnection, 'release');

				var user = proxyquire('../server/models/user.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(null, myConnection);}
				}});
				var routeSetup = proxyquire('../server/routes.js', {'./models/user.js': user});
				server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
				chai.request(server).post('/reset_password').set('Cookie', userCookie).send({ "userID" : "student.email2@kcl.ac.uk","password" : "newpassword","token" : "43f4886f63d41d81fc277fc4dbc028453abe86f4" })
					.end(function(err,resp){	
					try {
						assert.isNotNull(err);
						assert.equal(resp.statusCode, 500, 'status from result is not 500: ' + err.response.text);
						assert.equal(spy.callCount,2); 
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
			
				});
 			});
	
});
		
/******************************************************************Feedback*****************************************************************/
describe('Feedback Routes', () => {
		
	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Feedback', 'User', 'Session'],()=>db.populate(setup.FEEDBACK_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});

	it('should send status code 200 for storing feedback ', function(done) {
			chai.request(server)
		  .post('/api/users/feedback')
			.set('Cookie', cookie)
		  .send({ 
				"usefulness" :"1" ,
				"usability" :"1",
				"informative" : "1",
				"security" : "1",
				"accessibility" : "1",
				"reasons" : "blah blah blah",
				"comments" : "NLKGHJKLPKOJIUYGGUHIJOKLPKOJIHUYGFGHJK"})
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
		    done();
		     
 		 });
  });
	
	it('should send status code 400 for trying to send feedback without specifying reasons and commens (even empty ones) feedback ', function(done) {
			chai.request(server)
		  .post('/api/users/feedback')
			.set('Cookie', cookie)
		  .send({ 
				"usefulness" :"1" ,
				"usability" :"1",
				"informative" : "1",
				"security" : "1",
				"accessibility" : "1"})
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 400);
		    done();
		     
 		 });
  });

	it('should send back data consisting of all feedback', function(done) { 
			chai.request(server)
		  .get('/api/users/feedback')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 200);
				assert.deepEqual(res.body, [{ FeedbackID: 1,
																			Day: '2017-03-13T00:00:00.000Z',
																			Ratings: 'Usefulness : 4, Usability : 2, Informative : 3,  Security : 1, Accessibilty : 5',
																			Reasons: 'No time got work to do!',
																			Comments: 'Great App' },
																		{ FeedbackID: 2,
																			Day: '2017-03-12T00:00:00.000Z',
																			Ratings: 'Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5',
																			Reasons: 'Done using it!',
																			Comments: 'Bye' },
																		{ FeedbackID: 3,
																			Day: '2017-03-17T00:00:00.000Z',
																			Ratings: 'Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5',
																			Reasons: 'No time got work to do!',
																			Comments: 'Bye' },
																		{ FeedbackID: 4,
																			Day: '2017-03-14T00:00:00.000Z',
																			Ratings: 'Usefulness : 2, Usability : 2, Informative : 3,  Security : 5, Accessibilty : 5',
																			Reasons: 'Found what I want to do',
																			Comments: 'GG' 
																		}]);
		    done();
	
  		});
	});

	it('should send status code 204 for deleting feedback ', function(done) {
			chai.request(server)
		  .delete('/api/users/feedback?before_date=2017-03-17')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNull(err);
				assert.strictEqual(res.statusCode, 204);
		    done();
		     
 		 });
  });

	it('should send status code 404 for trying to delete feedback that doesn\'t exist ', function(done) { 
			chai.request(server)
		  .delete('/api/users/feedback?before_date=1985-03-01')
			.set('Cookie', cookie)
		  .end(function(err, res){
				assert.isNotNull(err);
				assert.strictEqual(res.statusCode, 404);
		    done();
		     
 		 });
	});

	it('should return status 500 on mysql connection error', function(done) {
		server.close();
			var users = proxyquire('../server/models/user.js', {'../config/connect_db.js': {
				getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
			}});


			var routeSetup = proxyquire('../server/routes.js', {'./models/user.js': users});
			server = proxyquire('../app_server.js',{'./server/routes.js': routeSetup});
			async.parallel([function(callback){chai.request(server).get('/api/users/feedback').set('Cookie', cookie).end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).post('/api/users/feedback').set('Cookie', cookie).send({ "usefulness" :"1" ,"usability" :"1","informative" : "1",
																																																											 "security" : "1","accessibility" : "1","reasons" : "blah blah blah",
																																																											 "comments" : "NLKGHJKLPKOJIUYGGUHIJOKLPKOJIHUYGFGHJK"})
		  																											 .end(function(err,resp){callback(null,{error:err, res:resp});});},
											function(callback){chai.request(server).delete('/api/users/feedback?before_date=1985-03-01').set('Cookie', cookie)
																															.end(function(err,resp){callback(null,{error:err, res:resp});});}],
			function(err, results){
				try {
					for(var key in results) {
						assert.isNotNull(results[key], 'result '+key+' is not null');
						assert.property(results[key], 'error', 'result '+key+' has error');
						assert.property(results[key], 'res', 'result '+key+' has response');
						assert.isNotNull(results[key].error, 'error from result '+key+' is not null');
						assert.equal(results[key].res.statusCode, 500, 'status from result '+key+' is not 500');
					}
					done();
				} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
 	});

});



/******************************************************************MISCELLANEOUS*****************************************************************/
describe('Miscellaneous Routes', () => {
	
	before(function(done) {
		this.timeout(0);
		db.clear(['User', 'Module'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_DATA, done));	
			
  });
		
	beforeEach(function(done){
		server = require('../app_server.js');
		db.clear(['Degree', 'DegreeBuild', 'User', 'Session'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	afterEach(function(done){
		server.close(()=> done());
	});
  

	

	
});
