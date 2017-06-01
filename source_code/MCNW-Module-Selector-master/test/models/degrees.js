var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var bcrypt = require('bcrypt');
var degree = require('../../server/models/degrees.js');
var db = require('../../server/config/connect_db.js');
var connection;
var setup = require('../test_setup.js');
var assert = chai.assert;
var async = require('async');
var proxyquire = require('proxyquire');

describe('Degree testing', function() {
   
    before(function(done) {
		this.timeout(0);
		db.getConnection(function(err, connectionHandle){
			if(err) return done(err);
				connection = connectionHandle;
				db.clear(['Module'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_DATA, done));	
			});
    });
		
	beforeEach(function(done){
		db.clear(['User','Degree', 'DegreeBuild','Session'],()=>db.populate(setup.DEGREE_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	after(function(done) {
		connection.release();
		done();
    });

		//Department Information Testing		

	it('should match the best degree for the user', function(done) {  
       var results = {DegreeTitle : "MSci Computer Science"};
	   degree.matchDegrees('akusiak@underground.net', function(err,rows){
							try {
								assert.isNull(err);
								assert.isObject(rows[0]);
								assert.deepEqual(rows[0], results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						});
 			});
		
		//Degree Information Testing
	
		it('should add a degree to the database', function(done) { 
       var results = {DegreeTitle : "BSc Mathematics with Computer Science", LengthOfStudy : 3};
					degree.addDegree("BSc Mathematics with Computer Science", 3, function(err){
							try {
								assert.isNull(err);
								connection.query('SELECT * FROM Degree WHERE DegreeTitle = "BSc Mathematics with Computer Science"', function(err,result){
									try{
										assert.isNull(err);
										assert.isArray(result);
										assert.deepEqual(result[0], results);
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

		it('should retrieve all degrees', function(done) { 
       var results = [{ 
												DegreeTitle: "BEng Computer Science with Engineering",
												LengthOfStudy: 3
											},
											{ 
												DegreeTitle: "BSc Computer Science",
												LengthOfStudy: 3
											},
											{
												DegreeTitle: "BSc Computer Science with Management",
												LengthOfStudy: 3
											},
											{ DegreeTitle : "BSc Mathematics with Finance", 
												LengthOfStudy : 3 
											},
											{
												DegreeTitle: "MSci Computer Science",
												LengthOfStudy: 4
											}];

											
					degree.getDegrees(function(err,rows){
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

		it('should add degree data from a csv file', function(done) { 
       var results = [{ DegreeTitle: "BEng Computer Science with Engineering", LengthOfStudy: 3},
        							{ DegreeTitle: "BSc Computer Science", LengthOfStudy: 3},
       								{ DegreeTitle: "BSc Computer Science with Management", LengthOfStudy: 3},
        							{ DegreeTitle: "BSc Mathematics with Finance", LengthOfStudy: 3 },
        							{ DegreeTitle: "Computer Sc", LengthOfStudy: 3},
        							{ DegreeTitle: "Geography", LengthOfStudy: 5},
        							{ DegreeTitle: "Maths", LengthOfStudy: 6},
        							{ DegreeTitle: "MSci Computer Science", LengthOfStudy: 4}];											
					degree.addBulkDegreeDataInfile('./test/sampledata/sampledegrees.csv', function(err){
					try {
						assert.isNull(err);
						connection.query('SELECT * FROM Degree',function(err,rows){
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
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});


		it('should add degree data from a csv file by bulk insertion', function(done) {
       var results = [{ DegreeTitle: "BEng Computer Science with Engineering", LengthOfStudy: 3},
        							{ DegreeTitle: "BSc Computer Science", LengthOfStudy: 3},
       								{ DegreeTitle: "BSc Computer Science with Management", LengthOfStudy: 3},
        							{ DegreeTitle: "BSc Mathematics with Finance", LengthOfStudy: 3 },
        							{ DegreeTitle: "Computer Sc", LengthOfStudy: 3},
        							{ DegreeTitle: "Geography", LengthOfStudy: 5},
        							{ DegreeTitle: "Maths", LengthOfStudy: 6},
        							{ DegreeTitle: "MSci Computer Science", LengthOfStudy: 4}];											
					degree.addBulkDegreeDataInsert('./test/sampledata/sampledegrees.csv', function(err){
					try {
						assert.isNull(err);
						connection.query('SELECT * FROM Degree',function(err,rows){
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
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
 			});


	it('should retrieve information on one degree', function(done) { 
       var results = [{DegreeTitle : "MSci Computer Science", LengthOfStudy : 4}];
					degree.getDegree("MSci Computer Science", function(err, rows){
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

		it('should update degree information', function(done) { 
       var results = [{ DegreeTitle : "BSc Computer Science with Communication Skills", LengthOfStudy : 3}];
					degree.updateDegree("BSc Computer Science with Management","BSc Computer Science with Communication Skills", 3, function(err){
							try {
								assert.isNull(err);
								connection.query('SELECT * FROM Degree WHERE DegreeTitle = "BSc Computer Science with Communication Skills"', function(err, result){
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
        
        it('should send NOT FOUND when updating unknown degree information', function(done) { 
       //var results = [{ DegreeTitle : "BSc Computer Science with Communication Skills", LengthOfStudy : 3}];
					degree.updateDegree("BSc Computer Science with False","BSc Computer Science with Test", 3, function(err){
							try {
								assert.isNotNull(err);
                                assert(err.message, "NOT_FOUND");
                                done();
						} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
						}					
					});
 			});


		it('should delete a degree by degree title', function(done) {  
				degree.deleteDegree("BEng Computer Science with Engineering", function(err){
					try {
						assert.isNull(err);	
						connection.query('SELECT * FROM Degree WHERE DegreeTitle = "BEng Computer Science with Engineering"', function(err,result){
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
        
        it('should send NOT FOUND when deleting unknown degree', function(done) {  
				degree.deleteDegree("BSC Fake Degree for Test", function(err){
					try {
						assert.isNotNull(err);	
                        assert(err.message, "NOT)FOUND");
						done();	
					} catch( e ) {
                        done( e );
					}
									
				});
							
 			});


			it('should create a module-degree assignment', function(done) { 
       var results = [{ 
          DegreeID: "BSc Mathematics with Finance",
          IsOptional: 1,
          ModuleID: "5SSMN210"
        }];
					degree.assignToDegree("BSc Mathematics with Finance", "5SSMN210", true, function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeModule WHERE DegreeID = '+
															 '"BSc Mathematics with Finance" AND ModuleID = "5SSMN210"', function(err,result){ 
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

			
				

			it('should add degree assignments in bulk', function(done) {
       var results = [{	DegreeID: "BSc Mathematics with Finance",	IsOptional: 0, ModuleID: "4CCS1FC1"},
        							{	DegreeID: "BSc Mathematics with Finance", IsOptional: 0, ModuleID: "5CCS2SEG"}];

					degree.assignToDegreeBulkInfile('./test/sampledata/sampledegreesassignments.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeModule WHERE DegreeID = "BSc Mathematics with Finance"', function(err,result){ 
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

			it('should add degree assignments with bulk insertions', function(done) {
       var results = [{	DegreeID: "BSc Mathematics with Finance",	IsOptional: 0, ModuleID: "4CCS1FC1"},
        							{	DegreeID: "BSc Mathematics with Finance", IsOptional: 0, ModuleID: "5CCS2SEG"}];
					degree.assignToDegreeBulkInsert('./test/sampledata/sampledegreesassignments.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeModule WHERE DegreeID = "BSc Mathematics with Finance"', function(err,result){ 
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


		it('should retrieve the modules assigned to a degree', function(done) { 
       var results = [{"CourseworkPercentage": 0, "Credits": 15, "Description": "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", "Faculty": "Informatics", "IsOptional": 0, 
											 "LectureDay": "Monday", "LectureTime": "14:00:00", "ModuleID": "4CCS1FC1", "Name": "Foundations of Computing 1", "Year": 1},
										 { "CourseworkPercentage": 20, "Credits": 15, "Description": "DATABASE SYSTEMS DESCRIPTION", "Faculty": "Informatics", "IsOptional": 0,
											 "LectureDay": "Friday", "LectureTime": "11:00:00", "ModuleID": "4CCS2DBS", "Name": "Database Systems", "Year": 1},
										 { "CourseworkPercentage": 20, "Credits": 15, "Description": "INTERNET SYSTEMS DESCRIPTION", "Faculty": "Informatics", "IsOptional": 1,
											 "LectureDay": "Thursday", "LectureTime": "13:00:00", "ModuleID": "5CCS1INS", "Name": "Internet Systems", "Year": 2},
										 { "CourseworkPercentage": 85, "Credits": 30, "Description": "SOFTWARE ENGINEERING DESCRIPTION", "Faculty": "Informatics", "IsOptional": 1,
											 "LectureDay": "Monday", "LectureTime": "12:00:00", "ModuleID": "5CCS2SEG", "Name": "Software Engineering Group Project", "Year": 2}]

			
					degree.getAssignments("BSc Computer Science", function(err,rows){
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
 
		it('should update a module-degree assignment', function(done) { 
       var results = [{ DegreeID: "MSci Computer Science", IsOptional: 1, ModuleID: "5CCS1INS"},
        							{	DegreeID: "MSci Computer Science", IsOptional: 0, ModuleID: "6CCS1MAL"}];

					degree.updateAssignment("MSci Computer Science", "5CCS1INS", true, function(err,rows){
						try {	
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeModule WHERE DegreeID = "MSci Computer Science"', function(err, result){
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
        
        it('should send NOT FOUND to update unknown module-degree assignment', function(done) { 
            degree.updateAssignment("MSci Fake Degree", "FakeModule", false, function(err,rows){
						try {	
							assert.isNotNull(err);
                            assert(err.message, "NOT_FOUND");
							done();
						} catch( e ) {
							done( e ); // failure: call done with an error Object to indicate that it() failed
						}		
					});
 			});

		it('should delete a module-degree assignment', function(done) { 
					degree.unassignFromDegree("BSc Computer Science with Management", "5CCS2SEG", function(err,rows){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeModule WHERE DegreeID = '+
															 '"BSc Computer Science with Management" AND ModuleID = "5CCS2SEG"', function(err, result){
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
	
	it('should return NOT_FOUND when trying to remove a non-existent assignment', function(done) { 
					degree.unassignFromDegree("BSc Computer Science with Management", "IDONTEXIST", function(err,rows){
						try {
							assert.isNotNull(err);
							assert(err.message, "NOT_FOUND");
							done();
						} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
						}					
					});
 			});

		it('should create a module dependency in a degree', function(done) {  
       var results = [{ DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4SSMN110"},
											{DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{DegreeID: "BSc Computer Science with Management", Dependency: "5SSMN210", Parent: "4SSMN110"}];

			 var data = ['4SSMN110'];
					degree.addDependencies("BSc Computer Science with Management", "5CCS2SEG", data, function(err){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleDependency WHERE DegreeID ='+
															 '"BSc Computer Science with Management"', function(err, result){
								try {
									assert.isNull(err);
									assert.isArray(result);
									assert.sameDeepMembers(result, results);
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
	
	it('should not add any module dependencies to a degree', function(done) {  
       var results = [{DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{DegreeID: "BSc Computer Science with Management", Dependency: "5SSMN210", Parent: "4SSMN110"}];

			 var data = [];
					degree.addDependencies("BSc Computer Science with Management", "5CCS2SEG", data, function(err){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleDependency WHERE DegreeID ='+
															 '"BSc Computer Science with Management"', function(err, result){
								try {
									assert.isNull(err);
									assert.isArray(result);
									assert.sameDeepMembers(result, results);
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


		it('should add degree dependencies from a csv file in bulk', function(done) { 
       var results = [{ DegreeID: "BSc Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
        							{	DegreeID: "MSci Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
        							{	DegreeID: "BSc Computer Science", Dependency: "5CCS1INS", Parent: "4CCS2DBS"},
        							{	DegreeID: "BSc Computer Science", Dependency: "4CCS2DBS", Parent: "5CCS1INS"},
											{ DegreeID: "BSc Computer Science", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "4SSMN110", Parent: "5SSMN210"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "5SSMN210", Parent: "4SSMN110"}];
  

					degree.addDependenciesBulkInfile('./test/sampledata/sampledegreesdependencies.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleDependency', function(err,result){ 
							try {
								assert.isNull(err);
								assert.isArray(result);
								assert.sameDeepMembers(result, results);
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


			it('should add degree dependencies with bulk insertions', function(done) {
       var results = [{ DegreeID: "BSc Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
        							{	DegreeID: "MSci Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
        							{	DegreeID: "BSc Computer Science", Dependency: "5CCS1INS", Parent: "4CCS2DBS"},
											{ DegreeID: "BSc Computer Science", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "5SSMN210", Parent: "4SSMN110"},
                                            { DegreeID: "BSc Computer Science", Dependency: "4CCS2DBS",  Parent: "5CCS1INS"},
											{ DegreeID: "BSc Computer Science with Management", Dependency: "4SSMN110", Parent: "5SSMN210"}];
					degree.addDependenciesBulkInsert('./test/sampledata/sampledegreesdependencies.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleDependency', function(err,result){ 
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

		
		it('should retrieve all module dependencies in a degree', function(done) { 
       var results = [ {
          DegreeID: "BSc Computer Science with Management",
          Dependency: "5CCS2SEG",
          Parent: "4CCS2DBS"
        },
        {
          DegreeID: "BSc Computer Science with Management",
					Dependency: "5SSMN210",
          Parent: "4SSMN110"
          
        }];
					degree.getDependencies("BSc Computer Science with Management", function(err,rows){
							try {
								assert.isNull(err);
								assert.isArray(rows);
								assert.sameDeepMembers(rows, results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						});
 			});

		it('should update a module dependency in a degree', function(done) { 
			var data = ["4CCS1FC1", "5CCS2SEG"];       
			var results = [{
          DegreeID: "MSci Computer Science",
          Dependency: "6CCS1MAL",
          Parent: "4CCS1FC1"
        },{
          DegreeID: "MSci Computer Science",
          Dependency: "6CCS1MAL",
          Parent: "5CCS2SEG"
        }];
					degree.updateDependencies("MSci Computer Science", "6CCS1MAL", data, function(err,rows){
						try {
						connection.query('SELECT * FROM ModuleDependency WHERE DegreeID = "MSci Computer Science"', function(err, result){
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
	
	it('should update module dependencies by deleting all of them for specified module when empty array passed', function(done) { 
			
			var results = [];
					degree.updateDependencies("MSci Computer Science", "6CCS1MAL", [], function(err,rows){
						try {
						connection.query('SELECT * FROM ModuleDependency WHERE DegreeID = "MSci Computer Science"', function(err, result){
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

		it('should delete a module dependency in a degree', function(done) { 
				var result = []

				degree.removeDependencies('BSc Computer Science', '5CCS2SEG', ['4CCS2DBS'], function(err){
					try {
						assert.isNull(err);
						connection.query('SELECT * FROM ModuleDependency WHERE DegreeID ='+
														 '"BSc Computer Science" AND Dependency = "5CCS2SEG"', function(err, rows){
							try {
								assert.isNull(err);
								assert.deepEqual(rows, result);
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
	
		it('should not delete any module dependencies in a degree', function(done) { 
				var result = [{DegreeID: 'BSc Computer Science', Dependency: '5CCS2SEG', Parent: '4CCS2DBS' } ]

					degree.removeDependencies('BSc Computer Science', '5CCS2SEG', [], function(err){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleDependency WHERE DegreeID ='+
															 '"BSc Computer Science" AND Dependency = "5CCS2SEG"', function(err, rows){
								try {
									assert.isNull(err);
									assert.deepEqual(rows, result);
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

		//Degree Building Testing
		
		it('should create degree build', function(done) { 
       var results = [
				{
          BuildID: 1,
          DegreeTemplate: "BSc Computer Science",
          Owner: "student.email2@kcl.ac.uk"
        },{
          BuildID: 2,
          DegreeTemplate: "MSci Computer Science",
          Owner: "student.email2@kcl.ac.uk"
        },
			  {
          BuildID: 3,
          DegreeTemplate: "MSci Computer Science",
          Owner: "student.email2@kcl.ac.uk"
        }];
					degree.createDegreeBuild("MSci Computer Science", "student.email2@kcl.ac.uk", function(err,rows){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM DegreeBuild', function(err, result){
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

		it('should retrieve degree build', function(done) {
            var results = {"buildID": 1, "components": [ {
              CourseworkPercentage: 0,
              Credits: 15,
              Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION",
              Evaluated: "Normal",
              Faculty: "Informatics",
              LectureDay: "Monday",
              LectureTime: "14:00:00",
              ModuleID: "4CCS1FC1",
              Name: "Foundations of Computing 1",
              Year: 1
            },
            {
              CourseworkPercentage: 20,
              Credits: 15,
              Description: "DATABASE SYSTEMS DESCRIPTION",
              Evaluated: "DEPENDENCY",
              Faculty: "Informatics",
              LectureDay: "Friday",
              LectureTime: "11:00:00",
              ModuleID: "4CCS2DBS",
              Name: "Database Systems",
              Year: 1
            },
            {
              CourseworkPercentage: 20,
              Credits: 15,
              Description: "INTERNET SYSTEMS DESCRIPTION",
              Evaluated: "DEPENDENT",
              Faculty: "Informatics",
              LectureDay: "Thursday",
              LectureTime: "13:00:00",
              ModuleID: "5CCS1INS",
              Name: "Internet Systems",
              Year: 2
            },
            {
              CourseworkPercentage: 0,
              Credits: 15,
              Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION",
              Evaluated: "Compulsory",
              Faculty: "Informatics",
              LectureDay: "Monday",
              LectureTime: "14:00:00",
              ModuleID: "4CCS1FC1",
              Name: "Foundations of Computing 1",
              Year: 1
            },
            {
              CourseworkPercentage: 20,
              Credits: 15,
              Description: "DATABASE SYSTEMS DESCRIPTION",
              Evaluated: "Compulsory",
              Faculty: "Informatics",
              LectureDay: "Friday",
              LectureTime: "11:00:00",
              ModuleID: "4CCS2DBS",
              Name: "Database Systems",
              Year: 1
            },
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
          "template": "BSc Computer Science"};
					degree.retrieveBuild(1, function(err,rows){
							try {
								assert.isNull(err);
								assert.isObject(rows);
								assert.deepEqual(rows, results);
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						});
 			});	

		it('should say build does not exist', function(done) { 
					degree.retrieveBuild(7, function(err,rows){
							try {
								assert.isNotNull(err);
								assert(err.message, 'BUILD_DOESN\'T_EXIST');
								done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
						});
 			});		

			it('should retrieve all degree builds for student with specified template', function(done) {
       var results = [{
          "buildID": 1,
          "components": [{CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Evaluated: "Normal", Faculty: "Informatics",
													LectureDay: "Monday", LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
            						 {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Evaluated: "DEPENDENCY", Faculty: "Informatics",
              						LectureDay: "Friday", LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1},
												 {CourseworkPercentage: 20, Credits: 15, Description: "INTERNET SYSTEMS DESCRIPTION", Evaluated: "DEPENDENT", Faculty: "Informatics", 
													LectureDay: "Thursday", LectureTime: "13:00:00", ModuleID: "5CCS1INS", Name: "Internet Systems", Year: 2},
												 {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Evaluated: "Compulsory", Faculty: "Informatics",
													LectureDay: "Monday", LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
												 {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Evaluated: "Compulsory", Faculty: "Informatics",
													LectureDay: "Friday", LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1},
											  ],
												"recommended": [{"DueTo": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
																				{"DueTo": "4CCS1FC1", "Recommendation": "6CCS1MAL"}
												 ],
												"template": "BSc Computer Science"
					}];
					degree.retrieveBuilds("student.email2@kcl.ac.uk", "BSc Computer Science", function(err,rows){
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

			it('should retrieve all degree builds for student', function(done) {
       var results = [{"buildID": 1, "components": [
				 								 {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Evaluated: "Normal", Faculty: "Informatics",
													LectureDay: "Monday", LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
            						 {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Evaluated: "DEPENDENCY", Faculty: "Informatics",
              						LectureDay: "Friday", LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1},
												 {CourseworkPercentage: 20, Credits: 15, Description: "INTERNET SYSTEMS DESCRIPTION", Evaluated: "DEPENDENT", Faculty: "Informatics", 
													LectureDay: "Thursday", LectureTime: "13:00:00", ModuleID: "5CCS1INS", Name: "Internet Systems", Year: 2},
												 {CourseworkPercentage: 0, Credits: 15, Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Evaluated: "Compulsory", Faculty: "Informatics",
													LectureDay: "Monday", LectureTime: "14:00:00", ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Year: 1},
												 {CourseworkPercentage: 20, Credits: 15, Description: "DATABASE SYSTEMS DESCRIPTION", Evaluated: "Compulsory", Faculty: "Informatics",
													LectureDay: "Friday", LectureTime: "11:00:00", ModuleID: "4CCS2DBS", Name: "Database Systems", Year: 1}],
												"recommended": [{"DueTo": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
																				{"DueTo": "4CCS1FC1", "Recommendation": "6CCS1MAL"}
												 ],
												"template": "BSc Computer Science"},
											{"buildID": 2, "components": [
												 {CourseworkPercentage: 20, Credits: 15, Description: "INTERNET SYSTEMS DESCRIPTION", Evaluated: "Compulsory", Faculty: "Informatics", 
													LectureDay: "Thursday", LectureTime: "13:00:00", ModuleID: "5CCS1INS", Name: "Internet Systems", Year: 2},
												 {CourseworkPercentage: 25, Credits: 70, Description: "MATRIX ALGEBRA DESCRIPTION", Evaluated: "Compulsory", Faculty: "Mathematics",
													LectureDay: "Thursday", LectureTime: "15:00:00", ModuleID: "6CCS1MAL", Name: "Matrix Algebra", Year: 3}],
												"recommended": [],
												"template": "MSci Computer Science"}
										 ];
					degree.retrieveBuilds("student.email2@kcl.ac.uk", null, function(err,rows){
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
		

		it('should update a degree build by adding information', function(done) { 
       var results = [{BuildID: 1, IsDependent: 0, ModuleID: "4CCS2DBS"},
											{BuildID: 1, IsDependent: 0, ModuleID: "4CCS1FC1"},
        							{BuildID: 1, IsDependent: 1, ModuleID: "5CCS1INS"},
       								{BuildID: 1, IsDependent: 1, ModuleID: "5CCS2SEG"}];
					degree.addToBuild(1, "5CCS2SEG", function(err){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM BuildComponent WHERE BuildID = 1', function(err, rows){
								try {
									assert.isNull(err);
									assert.isArray(rows);
									assert.sameDeepMembers(rows, results);
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
	

		it('should update a degree build by deleting information', function(done) { 
       var results = [{BuildID: 1, IsDependent: 0, ModuleID: "4CCS1FC1"}];
					degree.removeFromBuild(1,'5CCS1INS', function(err){
						try {
							assert.isNull(err);
							connection.query('SELECT * FROM BuildComponent WHERE BuildID = 1', function(err,rows){ 
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
							done( e ); // failure: call done with an error Object to indicate that it() failed
						}			
					});
 			});
		
			it('should delete a degree build', function(done) { 
					degree.removeBuild(1, function(err,rows){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM DegreeBuild WHERE BuildID = 1", function(err, result){
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

			it('should get the owner of a degree build', function(done) { 
					degree.getOwner(1, function(err,rows){
						try {
							assert.isNull(err);
							assert.deepEqual("student.email2@kcl.ac.uk", rows);
							done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
					});
 			});

			it('should send error build doesn\'t exist', function(done) { 
					degree.getOwner(4, function(err,rows){
						try {
							assert.isNotNull(err);
							assert.deepEqual(err.message, 'BUILD_DOESN\'T_EXIST');
							done(); // success: call done with no parameter to indicate that it() is done()
							} catch( e ) {
								done( e ); // failure: call done with an error Object to indicate that it() failed
							}					
					});
 			});

		/****************************************************Recommended Functions********************************************************/

			it('should add recommended modules in a degree', function(done) { 
                var results = [{DegreeID : "BSc Computer Science with Management", ModuleID: "5CCS2SEG", Recommendation: "4CCS2DBS"},
               								 {DegreeID : "BSc Computer Science with Management", ModuleID: "4SSMN110", Recommendation: "5SSMN210"},
                							 {DegreeID : "BSc Computer Science with Management", ModuleID: "5CCS1INS", Recommendation: "4CCS2DBS"},
                               {DegreeID : "BSc Computer Science with Management", ModuleID: "5CCS1INS", Recommendation: "5CCS2SEG"}];
					degree.addRecommended("BSc Computer Science with Management", "5CCS1INS", ["5CCS2SEG", "4CCS2DBS"], function(err,rows){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science with Management'", function(err, result){
								try {
									assert.isNull(err);
									assert.sameDeepMembers(result, results);
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
			
			it('should not add recommended modules to a degree', function(done) { 
                var results = [{DegreeID : "BSc Computer Science with Management", ModuleID: "5CCS2SEG", Recommendation: "4CCS2DBS"},
               								 {DegreeID : "BSc Computer Science with Management", ModuleID: "4SSMN110", Recommendation: "5SSMN210"}];
					degree.addRecommended("BSc Computer Science with Management", "5CCS1INS", null, function(err,rows){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science with Management'", function(err, result){
								try {
									assert.isNull(err);
									assert.sameDeepMembers(result, results);
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

				it('should update a recommendation', function(done) {
					var result = [{
          	DegreeID: "BSc Computer Science with Management",
          	ModuleID: "5CCS2SEG",
          	Recommendation: "4CCS1FC1"
        	},
        	{
          	DegreeID: "BSc Computer Science with Management",
         		ModuleID: "5CCS2SEG",
          	Recommendation: "5CCS1INS"
        	}];					
					var data = ["4CCS1FC1", "5CCS1INS"];
					degree.updateRecommended("BSc Computer Science with Management","5CCS2SEG", data, function(err){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science with Management' AND ModuleID = '5CCS2SEG'", function(err, rows){
								try {
									assert.isNull(err);
									assert.sameDeepMembers(rows,result);
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
	
		it('should update recommendations of a module by removing them all when passed an empty array', function(done) {
					var result = [];					
					var data = [];
					degree.updateRecommended("BSc Computer Science with Management","5CCS2SEG", data, function(err){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science with Management' AND ModuleID = '5CCS2SEG'", function(err, rows){
								try {
									assert.isNull(err);
									assert.sameDeepMembers(rows,result);
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
			
			it('should add module recommendations in bulk from a csv file ', function(done) { 
       var results = [ { "DegreeID": "BSc Computer Science", "ModuleID": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
											 { "DegreeID": "MSci Computer Science", "ModuleID": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
											 { "DegreeID": "BSc Mathematics with Finance", "ModuleID": "4CCS2DBS", "Recommendation": "6CCS1MAL"},
 											 { "DegreeID": "BSc Computer Science with Management", "ModuleID": "4SSMN110", "Recommendation": "5SSMN210"},
                                             { "DegreeID": "BSc Computer Science", "ModuleID": "5CCS2SEG",  "Recommendation": "4CCS2DBS"},
											 { "DegreeID": "BSc Computer Science with Management", "ModuleID": "5CCS2SEG", "Recommendation": "4CCS2DBS"},
                                             { "DegreeID": "MSci Computer Science", "ModuleID": "5CCS2SEG", "Recommendation": "5CCS1INS"}];

					degree.addRecommendationsBulkInfile('./test/sampledata/sampledegreesrecommendations.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleRecommendation', function(err,result){ 
							try {
								assert.isNull(err);
								assert.isArray(result);
								//expect(result).to.deep.have(results);
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

			it('should add module recommendations in bulk insertions ', function(done) { //TODO - data is not defined
       var results = [ { "DegreeID": "BSc Computer Science", "ModuleID": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
											 { "DegreeID": "MSci Computer Science", "ModuleID": "4CCS1FC1", "Recommendation": "6CCS1MAL"},
											 { "DegreeID": "BSc Mathematics with Finance", "ModuleID": "4CCS2DBS", "Recommendation": "6CCS1MAL"},
 											 { "DegreeID": "BSc Computer Science with Management", "ModuleID": "4SSMN110", "Recommendation": "5SSMN210"},
											 { "DegreeID": "BSc Computer Science", "ModuleID": "5CCS2SEG" , "Recommendation": "4CCS2DBS"},
											 { "DegreeID": "BSc Computer Science with Management", "ModuleID": "5CCS2SEG", "Recommendation": "4CCS2DBS"},
        							 { "DegreeID": "MSci Computer Science", "ModuleID": "5CCS2SEG", "Recommendation": "5CCS1INS"}];
					degree.addRecommendationsBulkInsert('./test/sampledata/sampledegreesrecommendations.csv', 
						function(err,rows){
						try{
							assert.isNull(err);
							connection.query('SELECT * FROM ModuleRecommendation', function(err,result){ 
								//console.log(result + " Given");
								//console.log(results + " Results?"); 
							try {
								assert.isNull(err);
								assert.isArray(result);
								//console.log(result + " Given");
								//console.log(results + " Results?"); 
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


				it('should get a recommended module', function(done) {  
					var results = [{DegreeID: "BSc Computer Science", ModuleID : "4CCS1FC1", Recommendation : "6CCS1MAL"},       
                                    {DegreeID : "BSc Computer Science", ModuleID : "5CCS2SEG", Recommendation : "4CCS2DBS"}];
					degree.getRecommended("BSc Computer Science", function(err,rows){
								try {
									assert.isNull(err);
                                    assert.sameDeepMembers(rows, results);
									done(); // success: call done with no parameter to indicate that it() is done()
								} catch( e ) {
									done( e ); // failure: call done with an error Object to indicate that it() failed
								}					
				});
 			});


			it('should send back nothing for an unknown DegreeID as recommended', function(done) { 
					degree.getRecommended("BSC Fake Degree", function(err,rows){
								try {
									assert.isNull(err);
									assert.deepEqual(rows.length, 0);
									done(); // success: call done with no parameter to indicate that it() is done()
								} catch( e ) {
									done( e ); // failure: call done with an error Object to indicate that it() failed
								}					
				});
 			});
			
			it('should delete a recommended module', function(done) { //degrees.js in server was changed from Recommendation IN to =
					degree.removeRecommended("BSc Computer Science","4CCS1FC1","6CCS1MAL", function(err,rows){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science'", function(err, result){
								try {
									assert.isNull(err);
									assert.deepEqual(result.length, 1);
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
			
			it('should not delete any recommended modules', function(done) { //degrees.js in server was changed from Recommendation IN to =
					degree.removeRecommended("BSc Computer Science","4CCS1FC1", "", function(err,rows){
						try {
							assert.isNull(err);
							connection.query("SELECT * FROM ModuleRecommendation WHERE DegreeID = 'BSc Computer Science'", function(err, result){
								try {
									assert.isNull(err);
									assert.deepEqual(result.length, 2);
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
				var degree = proxyquire('../../server/models/degrees.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
				async.parallel([function(callback){degree.matchDegrees('akusiak@underground.net', function(err){callback(null,err);});},
											 function(callback){degree.addDegree('BSc Mathematics with Computer Science', 3, function(err){callback(null,err);});},
											 function(callback){degree.addBulkDegreeDataInfile('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.addBulkDegreeDataInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.getDegrees(function(err){callback(null,err);});},
											 function(callback){degree.getDegree('BSc Computer Science', function(err){callback(null,err);});},
											 function(callback){degree.updateDegree('BSc Computer Science','newID', 4, function(err){callback(null,err);});},
											 function(callback){degree.deleteDegree('BSc Computer Science', function(err){callback(null,err);});},
											 function(callback){degree.assignToDegree('BSc Computer Science','4CCS1FC1', false, function(err){callback(null,err);});},
											 function(callback){degree.assignToDegreeBulkInfile('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.assignToDegreeBulkInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.getAssignments('BSc Computer Science', function(err){callback(null,err);});},
											 function(callback){degree.updateAssignment('BSc Computer Science', '4CCS1FC1', true, function(err){callback(null,err);});},
											 function(callback){degree.unassignFromDegree('BSc Computer Science', '4CCS1FC1', function(err){callback(null,err);});},
											 function(callback){degree.addDependencies('BSc Computer Science','4CCS1FC1', ['6CCS1MAL'], function(err){callback(null,err);});},
											 function(callback){degree.addDependenciesBulkInfile('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.addDependenciesBulkInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.getDependencies('BSc Computer Science', function(err){callback(null,err);});},
											 function(callback){degree.updateDependencies('BSc Computer Science', '4CCS1FC1', null, function(err){callback(null,err);});},
											 function(callback){degree.removeDependencies('BSc Computer Science', '4CCS1FC1', ['6CCS1MAL'], function(err){callback(null,err);});},
											 function(callback){degree.addRecommended('BSc Computer Science','4CCS1FC1', '6CCS1MAL', function(err){callback(null,err);});},
											 function(callback){degree.addRecommendationsBulkInfile('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.addRecommendationsBulkInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){degree.getRecommended('BSc Computer Science', function(err){callback(null,err);});},
											 function(callback){degree.updateRecommended('BSc Computer Science','4CCS1FC1', null, function(err){callback(null,err);});},
											 function(callback){degree.removeRecommended('BSc Computer Science','4CCS1FC1',['6CCS1MAL'], function(err){callback(null,err);});},
											 function(callback){degree.createDegreeBuild('BSc Computer Science','userID', function(err){callback(null,err);});},
											 function(callback){degree.retrieveBuild(1, function(err){callback(null,err);});},
											 function(callback){degree.retrieveBuilds('userID', null, function(err){callback(null,err);});},
											 function(callback){degree.addToBuild(1, '4CCS1FC1', function(err){callback(null,err);});},
											 function(callback){degree.removeFromBuild(1,'4CCS1FC1', function(err){callback(null,err);});},
											 function(callback){degree.removeBuild(1, function(err){callback(null,err);});},
											 function(callback){degree.getOwner(1, function(err){callback(null,err);});}],
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
