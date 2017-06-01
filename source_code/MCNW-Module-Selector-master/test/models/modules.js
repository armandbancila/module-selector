var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var bcrypt = require('bcrypt');
var modules = require('../../server/models/modules.js');
var db = require('../../server/config/connect_db.js');
var connection;
var assert = chai.assert;
var setup = require('../test_setup.js');
var proxyquire = require('proxyquire');
var async = require('async');
var sinon = require('sinon');

describe('Module testing', function() {
   
	before(function(done) {
		this.timeout(0);
		db.getConnection(function(err, connectionHandle){
			if(err) return done(err);
				connection = connectionHandle;
				db.clear(['Tag','User','Session'],()=>db.populate(setup.MODULE_SUITE_BEFORE_DATA, done));
			});
    });

	beforeEach(function(done){
		db.clear(['Module','UserTracking'],()=>db.populate(setup.MODULE_SUITE_BEFORE_EACH_DATA, done));	
	});

	after(function(done) {
		connection.release();
		done();
    });

	
	it('should retrieve all modules available', function(done) { 
		var results = {
        data: [
          {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Faculty: "Informatics", LectureDay: "Monday",
            LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
          {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Faculty: "Informatics", LectureDay: "Friday",
            LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1 },
          {CourseworkPercentage: 40, Credits: 15, Description: "ECONOMICS DESCRIPTION", Faculty: "Management", LectureDay: "Tuesday",
            LectureTime: "13:00:00", ModuleID: "4SSMN110", Name: "Economics", Year: 1},
          {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Faculty: "Informatics", LectureDay: "Wednesday",
		   LectureTime: "14:00:00", ModuleID: "5CCS1FC2", Name: "Foundations of Computing 2", Year: 1},
          {CourseworkPercentage: 20, Credits: 15, Description: "INTERNET SYSTEMS DESCRIPTION", Faculty: "Informatics", LectureDay: "Thursday",
            LectureTime: "13:00:00", ModuleID: "5CCS1INS", Name: "Internet Systems", Year: 2},
          {CourseworkPercentage: 15, Credits: 15, Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Faculty: "Informatics", LectureDay: "Wednesday",
            LectureTime: "10:00:00", ModuleID: "5CCS2OSC", Name: "Operating Systems and Concurrency", Year: 2},
          {CourseworkPercentage: 85, Credits: 30, Description: "SOFTWARE ENGINEERING DESCRIPTION", Faculty: "Informatics", LectureDay: "Monday",
            LectureTime: "12:00:00", ModuleID: "5CCS2SEG", Name: "Software Engineering Group Project", Year: 2},
          {CourseworkPercentage: 20, Credits: 15, Description: "ACCOUNTING DESCRIPTION", Faculty: "Management", LectureDay: "Friday",
            LectureTime: "09:00:00", ModuleID: "5SSMN210", Name: "Accounting", Year: 2},
		  {CourseworkPercentage: 20, Credits: 15, Description: "AERODYNAMICS DESCRIPTION", Faculty: "Mathematics", LectureDay: "Friday",
            LectureTime: "09:00:00", ModuleID: "7CCS2KLM", Name: "Aerodynamics", Year: 2 },
          {CourseworkPercentage: 40, Credits: 15, Description: "Blah", Faculty: "Management", LectureDay: "Thursday",
            LectureTime: "13:00:00", ModuleID: "7CCS2TDL", Name: "Todelete", Year: 1}
        ], "total": 10};


		modules.selectAll([], function(err,rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	it('should retrieve all modules available when no filters specified', function(done) { 
		var results = {
        data: [
          {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Faculty: "Informatics", LectureDay: "Monday",
            LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
          {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Faculty: "Informatics", LectureDay: "Friday",
            LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1 },
          {CourseworkPercentage: 40, Credits: 15, Description: "ECONOMICS DESCRIPTION", Faculty: "Management", LectureDay: "Tuesday",
            LectureTime: "13:00:00", ModuleID: "4SSMN110", Name: "Economics", Year: 1},
          {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Faculty: "Informatics", LectureDay: "Wednesday",
		   LectureTime: "14:00:00", ModuleID: "5CCS1FC2", Name: "Foundations of Computing 2", Year: 1},
          {CourseworkPercentage: 20, Credits: 15, Description: "INTERNET SYSTEMS DESCRIPTION", Faculty: "Informatics", LectureDay: "Thursday",
            LectureTime: "13:00:00", ModuleID: "5CCS1INS", Name: "Internet Systems", Year: 2},
          {CourseworkPercentage: 15, Credits: 15, Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Faculty: "Informatics", LectureDay: "Wednesday",
            LectureTime: "10:00:00", ModuleID: "5CCS2OSC", Name: "Operating Systems and Concurrency", Year: 2},
          {CourseworkPercentage: 85, Credits: 30, Description: "SOFTWARE ENGINEERING DESCRIPTION", Faculty: "Informatics", LectureDay: "Monday",
            LectureTime: "12:00:00", ModuleID: "5CCS2SEG", Name: "Software Engineering Group Project", Year: 2},
          {CourseworkPercentage: 20, Credits: 15, Description: "ACCOUNTING DESCRIPTION", Faculty: "Management", LectureDay: "Friday",
            LectureTime: "09:00:00", ModuleID: "5SSMN210", Name: "Accounting", Year: 2},
		  {CourseworkPercentage: 20, Credits: 15, Description: "AERODYNAMICS DESCRIPTION", Faculty: "Mathematics", LectureDay: "Friday",
            LectureTime: "09:00:00", ModuleID: "7CCS2KLM", Name: "Aerodynamics", Year: 2 },
          {CourseworkPercentage: 40, Credits: 15, Description: "Blah", Faculty: "Management", LectureDay: "Thursday",
            LectureTime: "13:00:00", ModuleID: "7CCS2TDL", Name: "Todelete", Year: 1}
        ], "total": 10};


		modules.selectFiltered([], {}, function(err,rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	it('should retrieve all modules selected by filters', function(done) {
		var res = {data:[{ModuleID : "5SSMN210", Name : "Accounting", Description : "ACCOUNTING DESCRIPTION", Year : 2, Credits: 15, LectureDay : "Friday", LectureTime : "09:00:00" , CourseworkPercentage : 20, Faculty : "Management"}], 
				   total: 1};
        var filters = {};
		filters.tags = ["BSc"];
		filters.moduleName = "Accounting";
		filters.lectureDays = ["Friday"];
		filters.range = "080000:120000";
		filters.courseworkPercentage = 20;
		filters.faculty = "Management";
		filters.credits = 15;
		filters.year = 2;
		modules.selectFiltered([], filters,  function(err,rows){ 
			try {
				assert.isNull(err);
				assert.deepEqual(rows,res);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
						
		});
 	});
	
	it('should retrieve all modules selected by filters passing single strings in place of arrays', function(done) {
		var res = {data:[{ModuleID : "5SSMN210", Name : "Accounting", Description : "ACCOUNTING DESCRIPTION", Year : 2, Credits: 15, LectureDay : "Friday", LectureTime : "09:00:00" , CourseworkPercentage : 20, Faculty : "Management"}], 
				   total: 1};
        var filters = {};
		filters.tags = "BSc";
		filters.moduleName = "Accounting";
		filters.lectureDays = "Friday";
		filters.range = "080000:120000";
		filters.courseworkPercentage = 20;
		filters.faculty = "Management";
		filters.credits = 15;
		filters.year = 2;
		modules.selectFiltered([], filters,  function(err,rows){ 
			try {
				assert.isNull(err);
				assert.deepEqual(rows,res);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
						
		});
 	});
	
	it('should retrieve no modules on page without results', function(done) {
		var res = {data:[],
					total: 1};
        var filters = {};
		filters.tags = ["BSc"];
		filters.moduleName = "Accounting";
		filters.lectureDays = ["Friday"];
		filters.range = "080000:120000";
		filters.courseworkPercentage = 20;
		filters.faculty = "Management";
		filters.credits = 15;
		filters.year = 2;
		modules.selectFiltered({perPage:1, pageNum: 5}, filters,  function(err,rows){ 
			try {
				assert.isNull(err);
				assert.deepEqual(rows,res);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
						
		});
 	});
	
 	it('should add new module to database', function(done) {  
		var moduleID = '5CCS1PEP', name = 'Practical Experiences of Programming', description = 'PEP DESCRIPTION', year = 2;
		var credits = 15, lecture_day = 'Monday', lecture_time = '16:00:00',  coursework_percentage = 15,  faculty = 'Informatics'; 
 		var results = [{ ModuleID : '5CCS1PEP',  Name : 'Practical Experiences of Programming', Description : 'PEP DESCRIPTION',  Year : 2, Credits : 15, LectureDay : 'Monday', LectureTime : '16:00:00', CourseworkPercentage : 15, Faculty : 'Informatics' }];

		modules.addModule(moduleID, name, description, year, credits, lecture_day, lecture_time, coursework_percentage, faculty,  function(err){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM Module WHERE ModuleID = (?)', [moduleID], function(err, rows){
 					try {
						assert.isNull(err);
						assert.isArray(rows);
						assert.deepEqual(rows, results);
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
 

		it('should retrieve correct module by moduleID', function(done) { 
		 		var moduleID = '5CCS2OSC';
		 		var results = [{ ModuleID : '5CCS2OSC',  Name : 'Operating Systems and Concurrency', Description : 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION',  Year : 2, Credits : 15, LectureDay : 'Wednesday', LectureTime : '10:00:00', CourseworkPercentage : 15, Faculty: 'Informatics' }];
				modules.getModule(moduleID, function(err,rows){
							try {
								assert.isNull(err);
								assert.isArray(rows);
								assert.deepEqual(rows, results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						
					});
		});
 
		it('should respond with error NOT_FOUND for non-existent module', function(done) {
				modules.getModule('IDONTEXIST', function(err){
							try {
								assert.isNotNull(err);
								assert.property(err, 'message');
								assert.deepEqual(err.message, 'NOT_FOUND');
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						
					});
		});

 		it('should remove module by ID from database', function(done) { 
				 modules.removeModule('4CCS1FC1', function(err){
						try{ assert.isNull(err);} catch(e){ return done(e)};
					 	connection.query('SELECT * FROM Module WHERE ModuleID = "4CCS1FC1"', function(err, rows){
							try {
								assert.isNull(err);
								assert.deepEqual(rows.length,0);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						});
					});
 			});
        
        it('should send NOT FOUND to delete unknown module from database', function(done) { 
				 modules.removeModule('FakeModule', function(err){
						try {
								assert.isNotNull(err);
								assert(err.message, "NOT_FOUND");
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
					});
 			});
 
 			it('should add a module to the list of modules tracked by the user', function(done) { 
				var module = '5CCS2SEG';
				var userID = 'student.email1@kcl.ac.uk';
				var results = [{UserID : 'student.email1@kcl.ac.uk', ModuleID : '4CCS1FC1'}, {UserID : 'student.email1@kcl.ac.uk', ModuleID : '5CCS2OSC'}]; 
				modules.addTrackedModules('4CCS1FC1','student.email1@kcl.ac.uk', function(err){
					try { 
						assert.isNull(err);
                        connection.query('SELECT * FROM UserTracking WHERE UserID = ?', [userID], function(err, rows) {
							try {
								assert.isNull(err);
								assert.isArray(rows);
								assert.deepEqual(rows, results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch(e) {
								done(e); // failure: call done with an error Object to indicate that it() failed
							}
           				});
					} catch(e) {
						done(e); // failure: call done with an error Object to indicate that it() failed
					}

				});
			});
 			

																	 		   
		it('should return the tracked modules of a user by userID', function(done) { 
				var userID = 'student.email1@kcl.ac.uk';
				var results = [{ ModuleID : '5CCS2OSC',  Name : 'Operating Systems and Concurrency', Description : 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION',  Year : 2, Credits : 15, LectureDay : 'Wednesday', LectureTime : '10:00:00', CourseworkPercentage : 15, Faculty: 'Informatics' }];
				modules.returnTrackedModules('student.email1@kcl.ac.uk', [2,1] ,  function(err, rows){
							try { 
								assert.isNull(err);
								assert.isArray(rows.data);
								assert.deepEqual(rows.data, results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}
					});
 			});

		it('should delete the module from tracked modules', function(done) { 
			var userID = 'student.email2@kcl.ac.uk';
			var moduleID = '5CCS1INS';
			modules.removeTrackedModules(moduleID, userID, function(err){
				try {
					assert.isNull(err);
					connection.query('SELECT * FROM UserTracking WHERE UserID = (?) AND ModuleID = (?)', [userID, moduleID], function(err, rows){
						try {
							assert.isNull(err);
							assert.deepEqual(rows.length,0); //it returns the empty set 
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
	
		it('should return NOT_FOUND error when removing non-tracked module', function(done) { 
			modules.removeTrackedModules('student.email2@kcl.ac.uk','idontexist', function(err){
				try {
					assert.isNotNull(err);
					assert.strictEqual(err.message, 'NOT_FOUND');
					done(); // success: call done with no parameter to indicate that it() is done()					
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}	
       });
		});

		it('should get modules by faculty', function(done) { 
			var results = [{Faculty: "Informatics"},{ Faculty: "Management"},{ Faculty: "Mathematics"}];
			modules.getModulesByFaculty(function(err,rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}					
			});
		});

		it('should get all information on given modules', function(done) { 
				var moduleIDs = ["5CCS2OSC", "5CCS2SEG"];
				var results = [{
          CourseworkPercentage: 15,
          Credits: 15,
          Description: "OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION",
          Faculty: "Informatics",
          LectureDay: "Wednesday",
          LectureTime: "10:00:00",
          ModuleID: "5CCS2OSC",
          Name: "Operating Systems and Concurrency",
          Year: 2
        },
        {
          CourseworkPercentage: 85,
          Credits: 30,
          Description: "SOFTWARE ENGINEERING DESCRIPTION",
          Faculty: "Informatics",
          LectureDay: "Monday",
          LectureTime: "12:00:00",
          ModuleID: "5CCS2SEG",
          Name: "Software Engineering Group Project",
          Year: 2
        }];
				modules.getModules(moduleIDs, function(err,rows){
							try {
								assert.isNull(err);
								assert.deepEqual(rows, results); 
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
				});
		});

		it('should update information of a given module', function(done) { 
			var results = [{ CourseworkPercentage: 15, Credits: 30, Description: "Learn to fly", Faculty: "Mathematics",
          					 LectureDay: "Thursday", LectureTime: "12:00:00", ModuleID: "7CCS2KLM", Name: "Study of aircrafts", Year: 2}];
			modules.updateModule("7CCS2KLM", "7CCS2KLM", "Study of aircrafts", "Learn to fly", 2, 30, "Thursday", "12:00:00",15,
								 "Mathematics", function(err){
				try {
					assert.isNull(err);
					connection.query('SELECT * FROM Module WHERE ModuleID = "7CCS2KLM"', function(err,rows){
						try {
							assert.isNull(err);
							assert.deepEqual(rows, results); 
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
        it('should send NOT FOUND when updating unknown module', function(done) { 
			modules.updateModule("FakeModule", "7CCS2KLM", "Send not found", "test for error", 2, 30, "Thursday", "15:00:00",15,
								 "Fake faculty", function(err){
				try {
					assert.isNotNull(err);
                    assert(err.message, "NOT_FOUND");
					done();
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}						
			});
		});

		it('should return filtered tracked modules', function(done) { 
			var results = [{ ModuleID : '5CCS2OSC',  Name : 'Operating Systems and Concurrency', Description : 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION',  
							 Year : 2, Credits : 15, LectureDay : 'Wednesday', LectureTime : '10:00:00', CourseworkPercentage : 15, Faculty: 'Informatics'}];
			var filters = {};
			filters.tags = ["BSc"];
			filters.moduleName = "Operating Systems and Concurrency";
			filters.lectureDays = ["Wednesday"];
			filters.range = "100000:130000";
			filters.courseworkPercentage = 15;
			filters.faculty = "Informatics";
			filters.credits = 15;
			filters.year = 2;
			modules.returnFilteredTrackedModules('student.email1@kcl.ac.uk', [1,1] ,filters, function(err, rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows.data, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
		});
		
		it('should return filtered tracked modules with string parameters instead of arrays', function(done) { 
			var results = [{ ModuleID : '5CCS2OSC',  Name : 'Operating Systems and Concurrency', Description : 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION',  
							 Year : 2, Credits : 15, LectureDay : 'Wednesday', LectureTime : '10:00:00', CourseworkPercentage : 15, Faculty: 'Informatics'}];
			var filters = {};
			filters.tags = "BSc";
			filters.moduleName = "Operating Systems and Concurrency";
			filters.lectureDays = "Wednesday";
			filters.range = "100000:130000";
			filters.courseworkPercentage = 15;
			filters.faculty = "Informatics";
			filters.credits = 15;
			filters.year = 2;
			modules.returnFilteredTrackedModules('student.email1@kcl.ac.uk', [1,1] ,filters, function(err, rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows.data, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
		});
	
		it('should return all tracked modules with no filters specified', function(done) { 
			var results = [{ ModuleID : '5CCS2OSC',  Name : 'Operating Systems and Concurrency', Description : 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION',  
							 Year : 2, Credits : 15, LectureDay : 'Wednesday', LectureTime : '10:00:00', CourseworkPercentage : 15, Faculty: 'Informatics'}];
			var filters = {};
			modules.returnFilteredTrackedModules('student.email1@kcl.ac.uk', [1,1] ,filters, function(err, rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows.data, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
		});


		it('should increment the counter for each tag specified with a module', function(done) {
			var results = [ {TagName: "BSc", ModuleID: "4CCS1FC1", Count:2}, 
							{TagName: "BSc", ModuleID: "5CCS1FC2", Count: 2},
							{TagName: "BSc", ModuleID: "5CCS1INS", Count: 1},
							{TagName: "Business Intelligence Manager", ModuleID: "5CCS1FC2", Count: 1},
							{TagName: "Business Intelligence Manager", ModuleID: "5SSMN210", Count: 3},
							{TagName: "Year 1", ModuleID: "5CCS1FC2", Count: 1}];

			var tagNames = ["BSc","Year 1","Business Intelligence Manager"];

			modules.countTracking(tagNames, "5CCS1FC2", function(err, rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows.affectedRows, 4); //On duplicate key update statement has affectedRow value 2
					connection.query('SELECT * FROM Tracked', function(err,rows){
						try {
							assert.isNull(err);
							assert.deepEqual(rows, results); 
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

	it('should return average popular recommendations when no tags specified', function(done) { 
		var results = [{"CourseworkPercentage": 20, "Credits": 15, "Description": "ACCOUNTING DESCRIPTION", "Faculty": "Management",
										"LectureDay": "Friday", "LectureTime": "09:00:00", "ModuleID": "5SSMN210", "Name": "Accounting", "Rank": 3, "Year": 2},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Monday",	"LectureTime": "14:00:00",	"ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Rank": 2, "Year": 1},];
		
		modules.getRecommended(null, "student.email2@kcl.ac.uk", 2, function(err,rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, results); 
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});
	});
	
	it('should return recommendations matching specified tags', function(done) { 
		var results = [{"CourseworkPercentage": 20, "Credits": 15, "Description": "ACCOUNTING DESCRIPTION", "Faculty": "Management",
										"LectureDay": "Friday", "LectureTime": "09:00:00", "ModuleID": "5SSMN210", "Name": "Accounting", "Rank": 1, "Year": 2},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Monday",	"LectureTime": "14:00:00",	"ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Rank": 0.66666667, "Year": 1},];
		var tagNames = ["BSc","Year 1","Business Intelligence Manager"]
		modules.getRecommended(tagNames, "student.email2@kcl.ac.uk", 2, function(err,rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, results); 
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});
	});
	
	it('should return recommendations matching specified tag when provided as string', function(done) { 
		var results = [{"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Monday",	"LectureTime": "14:00:00",	"ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Rank": 2, "Year": 1},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description":  "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Wednesday", "LectureTime": "14:00:00", "ModuleID": "5CCS1FC2", "Name": "Foundations of Computing 2", "Rank": 1, "Year": 1},];
		var tagNames = "BSc";
		modules.getRecommended(tagNames, "student.email2@kcl.ac.uk", 2, function(err,rows){
			try {
				assert.isNull(err);
				assert.deepEqual(rows, results); 
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}
		});
	});
	
	it('should return recommendations when wanted string is not numerical', function(done) {
		var results = [{"CourseworkPercentage": 20, "Credits": 15, "Description": "ACCOUNTING DESCRIPTION", "Faculty": "Management",
										"LectureDay": "Friday", "LectureTime": "09:00:00", "ModuleID": "5SSMN210", "Name": "Accounting", "Rank": 1, "Year": 2},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Monday",	"LectureTime": "14:00:00",	"ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Rank": 0.66666667, "Year": 1},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Wednesday", "LectureTime": "14:00:00", "ModuleID": "5CCS1FC2", "Name": "Foundations of Computing 2", "Rank": 0.33333333, "Year": 1}];
			var tagNames = ["BSc","Year 1","Business Intelligence Manager"]
			modules.getRecommended(tagNames, "student.email2@kcl.ac.uk", 'NaN', function(err,rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
	});
	
	it('should return recommendations when wanted is not specified', function(done) {
		var results = [{"CourseworkPercentage": 20, "Credits": 15, "Description": "ACCOUNTING DESCRIPTION", "Faculty": "Management",
										"LectureDay": "Friday", "LectureTime": "09:00:00", "ModuleID": "5SSMN210", "Name": "Accounting", "Rank": 1, "Year": 2},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Monday",	"LectureTime": "14:00:00",	"ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Rank": 0.66666667, "Year": 1},
									 {"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics",
										"LectureDay": "Wednesday", "LectureTime": "14:00:00", "ModuleID": "5CCS1FC2", "Name": "Foundations of Computing 2", "Rank": 0.33333333, "Year": 1}];
			var tagNames = ["BSc","Year 1","Business Intelligence Manager"]
			modules.getRecommended(tagNames, "student.email2@kcl.ac.uk", null, function(err,rows){
				try {
					assert.isNull(err);
					assert.deepEqual(rows, results); 
					done(); // success: call done with no parameter to indicate that it() is done()
				} catch( e ) {
					done( e ); // failure: call done with an error Object to indicate that it() failed
				}
			});
	});

	it('should add module data from a csv file', function(done) {
       var results = [	{ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0, Faculty:"Informatics"},
						{ModuleID:"4CCS1KIU", Name:"Kale Imperial Unicorn", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"4CCS2DBS", Name:"Database Systems", Description:"DATABASE SYSTEMS DESCRIPTION", Year:1, Credits:15, LectureDay:"Friday", LectureTime:"11:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
						{ModuleID:"4SSMN110", Name:"Economics", Description:"ECONOMICS DESCRIPTION", Year:1, Credits:15, LectureDay:"Tuesday", LectureTime:"13:00:00", CourseworkPercentage: 40 , Faculty:"Management"}, 
						{ModuleID:"5CCS1FC2", Name:"Foundations of Computing 2", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Wednesday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics"},
						{ModuleID:"5CCS1INS", Name:"Internet Systems", Description:"INTERNET SYSTEMS DESCRIPTION", Year:2, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
						{ModuleID:"5CCS2BLH", Name:"Blah", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2GRE", Name:"Greek Revolution Ecclesiastic", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2OSC", Name:"Operating Systems and Concurrency", Description:"OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Year:2, Credits:15, LectureDay:"Wednesday", LectureTime:"10:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2SEG", Name:"Software Engineering Group Project", Description:"SOFTWARE ENGINEERING DESCRIPTION", Year:2, Credits:30, LectureDay:"Monday", LectureTime:"12:00:00", CourseworkPercentage:85, Faculty:"Informatics"},
						{ModuleID:"5SSMN210", Name:"Accounting", Description:"ACCOUNTING DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Management"},
						{ModuleID:"7CCS2KLM", Name:"Aerodynamics", Description:"AERODYNAMICS DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Mathematics"},
						{ModuleID:"7CCS2TDL", Name:"Todelete", Description:"Blah", Year:1, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:40, Faculty:"Management"}];
		
		modules.addBulkModuleDataInfile('./test/sampledata/samplemodules.csv', function(err,rows){
				try{
					assert.isNull(err);
					connection.query('SELECT * FROM Module', function(err,result){ 
						try {
							assert.isNull(err);
							assert.isArray(result);
							assert.deepEqual(result, results);
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

	it('should add module data in bulk', function(done) {
    	var results = [	{ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0, Faculty:"Informatics"},
						{ModuleID:"4CCS1KIU", Name:"Kale Imperial Unicorn", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"4CCS2DBS", Name:"Database Systems", Description:"DATABASE SYSTEMS DESCRIPTION", Year:1, Credits:15, LectureDay:"Friday", LectureTime:"11:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
						{ModuleID:"4SSMN110", Name:"Economics", Description:"ECONOMICS DESCRIPTION", Year:1, Credits:15, LectureDay:"Tuesday", LectureTime:"13:00:00", CourseworkPercentage: 40 , Faculty:"Management"}, 
						{ModuleID:"5CCS1FC2", Name:"Foundations of Computing 2", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Wednesday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics"},
						{ModuleID:"5CCS1INS", Name:"Internet Systems", Description:"INTERNET SYSTEMS DESCRIPTION", Year:2, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
						{ModuleID:"5CCS2BLH", Name:"Blah", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2GRE", Name:"Greek Revolution Ecclesiastic", Description:"Not imp", Year:2, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2OSC", Name:"Operating Systems and Concurrency", Description:"OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Year:2, Credits:15, LectureDay:"Wednesday", LectureTime:"10:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
						{ModuleID:"5CCS2SEG", Name:"Software Engineering Group Project", Description:"SOFTWARE ENGINEERING DESCRIPTION", Year:2, Credits:30, LectureDay:"Monday", LectureTime:"12:00:00", CourseworkPercentage:85, Faculty:"Informatics"},
						{ModuleID:"5SSMN210", Name:"Accounting", Description:"ACCOUNTING DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Management"},
						{ModuleID:"7CCS2KLM", Name:"Aerodynamics", Description:"AERODYNAMICS DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Mathematics"},
						{ModuleID:"7CCS2TDL", Name:"Todelete", Description:"Blah", Year:1, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:40, Faculty:"Management"}];
		
		modules.addBulkModuleDataInsert('./test/sampledata/samplemodules.csv', function(err,rows){
			try{
				assert.isNull(err);
				connection.query('SELECT * FROM Module', function(err,result){ 
					try {
						assert.isNull(err);
						assert.isArray(result);
						assert.deepEqual(result, results);
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
				var module = proxyquire('../../server/models/modules.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
				async.parallel([function(callback){module.selectAll([],function(err){callback(null,err);});},
											 function(callback){module.selectFiltered([1,1], {}, function(err){callback(null,err);});},
											 function(callback){module.getModule('5CCS2OSC', function(err){callback(null,err);});},
											 function(callback){module.getModulesByFaculty(function(err){callback(null,err);});},
											 function(callback){module.getModules(['5CCS2OSC'],function(err){callback(null,err);});},
											 function(callback){module.addModule('5CC2PJK', 'Poker joking kangoroo', 'Unknown',2, 15, 'Monday', '14:00:00', 80, "Aerodynamics", function(err){callback(null,err);});},
											 function(callback){module.updateModule('5CC2PJK', '5CCS2PJK', 'Poker joking kangoroo', 'Unknown',2, 15, 'Monday', '14:00:00', 80, "Aerodynamics", function(err){callback(null,err);});},
											 function(callback){module.removeModule('5CCS1NPM', function(err){callback(null,err);});},
											 function(callback){module.addTrackedModules('5CCS2PJK', 'student.email1@kcl.ac.uk', function(err){callback(null,err);});},
											 function(callback){module.returnTrackedModules('testuser',[], function(err){callback(null,err);});},
											 function(callback){module.returnFilteredTrackedModules('testuser',[1,1],{}, function(err){callback(null,err);});},
											 function(callback){module.removeTrackedModules('4CCS1FC1','testuser', function(err){callback(null,err);});},
											 function(callback){module.countTracking(["BSc"], '4CCS1FC1', function(err){callback(null,err);});},
											 function(callback){module.addBulkModuleDataInfile('./test/sampledata/samplemodules.csv', function(err){callback(null,err);});},
											 function(callback){module.addBulkModuleDataInsert('./test/sampledata/samplemodules.csv', function(err){callback(null,err);});},
											 function(callback){module.getRecommended(['BSc'], 'testuser', 2, function(err){callback(null,err);});},],
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

		it('should return error on mysql query error in first query', function(done) {
				var myConnection = {query: function(query, data, done){done(new Error('MY_QUERY_ERROR'));}, release: function(){}};
				var spy = sinon.spy(myConnection, 'release');
				var module = proxyquire('../../server/models/modules.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(null, myConnection);}
				}});
				async.parallel([function(callback){module.selectAll([],function(err){callback(null,err);});},
											 function(callback){module.selectFiltered([1,1], {}, function(err){callback(null,err);});},
											 function(callback){module.returnTrackedModules('testuser',[], function(err){callback(null,err);});},
											 function(callback){module.returnFilteredTrackedModules('testuser',[1,1],{}, function(err){callback(null,err);});},
											 function(callback){module.getRecommended(['BSc'], 'testuser', 'NaN', function(err){callback(null,err);});},],
				function(err, results){
					try {
						for(var key in results) {
							assert.isNotNull(results[key], 'result '+key+' is not null');
							assert.typeOf(results[key], 'Error', 'result '+key+' is an error');
							assert.equal(results[key].message, 'MY_QUERY_ERROR');
						}
						assert.equal(spy.callCount, 5);
						done();
					} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});


});
