var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var bcrypt = require('bcrypt');
var tag = require('../../server/models/tags.js');
var db = require('../../server/config/connect_db.js');
var connection;
var setup = require('../test_setup.js');
var assert = chai.assert;
var async = require('async');
var proxyquire = require('proxyquire');

describe('Tags testing', function() {
	
    before(function(done) {
		this.timeout(0);
		db.getConnection(function(err, connectionHandle){
			if(err) return done(err);
			connection = connectionHandle;
			db.clear(['Module'],()=>db.populate(setup.TAG_SUITE_BEFORE_DATA, done));
		});
    });

	beforeEach(function(done){
		db.clear(['Tag', 'ModuleTag', 'User','Session'],()=>db.populate(setup.TAG_SUITE_BEFORE_EACH_DATA, done));	
	});
	
	after(function(done) {
		connection.release();
		done();
    });

	it('should retrieve all categories of tags', function(done) {
		var results = [{Category: "Careers"},{Category: "Degree"},{Category: "Skills"}];
		tag.getCategories(function(err, rows){
			try {
				assert.isNull(err);
				assert.isObject(rows[0]);
				assert.deepEqual(rows, results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
				
    });

 
	it('should retrieve all tags', function(done) {
		var results = [{TagName :'Astrology', Category : 'Careers'},
					   {TagName :'BSc', Category : null},
											 {TagName :'BSc Computer Science', Category : 'Degree'},
											 {TagName :'BSc Computer Science with Management', Category : 'Degree'},
											 {TagName :'Business Intelligence Manager', Category : 'Careers'},
											 {TagName :'Communication', Category : 'Skills'},
											 {TagName :'Data Architect', Category :'Careers'},
											 {TagName :'DeleteTag' , Category : null},
											 {TagName :'Internet', Category : 'Careers'},
											 {TagName :'Maths', Category : 'Skills'},
											 {TagName :'MSc', Category : null},
											 {TagName :'MSci Computer Science', Category : 'Degree'},
											 {TagName :'Physicist', Category : 'Careers'},
											 {TagName :'Software Engineer', Category : 'Careers'},
											 {TagName :'System Analyst', Category : 'Careers'},
											 {TagName :'Year 1', Category : null},
											 {TagName :'Year 2', Category : null},
											 {TagName :'Year 3', Category : null}];
		tag.getTags(function(err, rows){
			try {
				assert.isNull(err);
				assert.isObject(rows[0]);
				assert.deepEqual(rows, results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
				
    });
 
 
 	it('should retrieve the tags assigned to a module', function(done) { 
    	var results = [{Category : "Careers", TagName : "System Analyst" }];
		tag.selectTags('5CCS1INS', function(err,rows){
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
 

 	it('should create a tag', function(done) {
 		var tagName = 'PhD', category = null;
        var results = { TagName : 'PhD', Category : null };
		tag.createTag('PhD', null, function(err){
			try{
				assert.isNull(err);
				connection.query('SELECT * FROM Tag WHERE TagName = "PhD"', function(err, rows){
					try {
						assert.isNull(err);
						assert.isObject(rows[0]);
						assert.deepEqual(rows[0], results);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}					
				});
			} catch(e){
				done(e);					
			}
		});
 	}); 

	it('should update a tag ', function(done) { 
		var results = [{TagName : "Study of Physics", Category : null}];
		tag.updateTag('Physicist', 'Study of Physics', null, function(err){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM Tag WHERE TagName = "Study of Physics"', function(err, rows){
					try {
						assert.isNull(err);
						assert.deepEqual(rows,results);
						done(); // success: call done with no parameter to indicate that it() is done()
					}catch(e) {
						done(e); // failure: call done with an error Object to indicate that it() failed
					}					
				});
			} catch(e){
				done(e);
			}
		});
	});
    
    it('should send NOT FOUND to update unknown tag ', function(done) {
		tag.updateTag('FakeTag', 'FakeNewTag', null, function(err){
			try {
				assert.isNotNull(err);
                assert(err.message, "NOT_FOUND");
				done();
			} catch(e){
				done(e);
			}
		});
	});
 
 	it('should delete a tag by tagName', function(done) { 
		tag.deleteTag('Astrology', function(err){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM Tag WHERE TagName = "Astrology"',function(err,rows){
					try {
						assert.isNull(err);
						assert.deepEqual(rows.length,0);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}	
				});
			} catch(e){
				done(e);
			}
		});
 	});
    
    it('should send NOT FOUND to delete unknown tag', function(done) { 
		tag.deleteTag('FakeTag', function(err){
			try {
				assert.isNotNull(err);
				assert(err.message, "NOT_FOUND");
				done();
			} catch(e){
				done(e);
			}
		});
 	});

	it('should retrieve the assigned tags that modules have', function(done) { 
 		var moduleIDs = ["4CCS1FC1","5CCS2SEG","5SSMN210"];
		var results = [{TagName : "BSc", Category : null},
						   {TagName : "BSc Computer Science with Management", Category : "Degree"},
						   {TagName : "Business Intelligence Manager", Category : "Careers"},
						   {TagName : "Data Architect", Category : 'Careers'},
						   {TagName : "Maths", Category : "Skills"},
						   {TagName : "Software Engineer", Category : 'Careers'},
					       {TagName : "Year 1", Category : null},
	     				   {TagName : "Year 2", Category : null}];
		tag.getAssigned(moduleIDs, function(err,rows){
			try {
				assert.isNull(err);
				assert.isObject(rows[0]);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	it('should retrieve the assigned tags of a module given a string', function(done) { 
 		var moduleIDs = "4CCS1FC1";
		var results = [{TagName : "Data Architect", Category : 'Careers'},
						   {TagName : "Maths", Category : "Skills"},
					       {TagName : "Year 1", Category : null}];
		tag.getAssigned(moduleIDs, function(err,rows){
			try {
				assert.isNull(err);
				assert.isObject(rows[0]);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});
	
	it('should retrieve all assigned tags when no modules specified', function(done) { 
		var results = [{TagName : "BSc", Category : null},
						   {TagName : "BSc Computer Science with Management", Category : "Degree"},
						   {TagName : "Business Intelligence Manager", Category : "Careers"},
						   {TagName : "Data Architect", Category : 'Careers'},
						   {TagName : "Maths", Category : "Skills"},
						   {TagName : "Software Engineer", Category : 'Careers'},
							 {TagName: "System Analyst", Category: "Careers"},
					     {TagName : "Year 1", Category : null},
	     				 {TagName : "Year 2", Category : null}];
		tag.getAssigned([], function(err,rows){
			try {
				assert.isNull(err);
				assert.isObject(rows[0]);
				assert.deepEqual(rows,results);
				done(); // success: call done with no parameter to indicate that it() is done()
			} catch( e ) {
				done( e ); // failure: call done with an error Object to indicate that it() failed
			}					
		});
 	});

	
	it('should assign Tag to Module', function(done) { 
		var results = { ModuleID : '5CCS2OSC', TagName : 'Year 2' };
		tag.assignTag('Year 2','5CCS2OSC', function(err,rows){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM ModuleTag WHERE ModuleID = "5CCS2OSC" AND TagName = "Year 2"',function(err,rows){
					try {
						assert.isNull(err);
						assert.strictEqual(rows.length,1);
						assert.isObject(rows[0]);
						assert.deepEqual(rows[0],results);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}
				});
			}	catch (e){
				done(e);
			}				
		});	
	});

	it('should unassign Tag to Module', function(done) { 
		tag.unassignTag('Year 1','4CCS2DBS', function(err){
			try {
				assert.isNull(err);
				connection.query('SELECT * FROM ModuleTag WHERE ModuleID = "4CCS2DBS" AND TagName = "Year 1"', function(err, rows){
					try {
						assert.isNull(err);
						assert.strictEqual(rows.length,0);
						done(); // success: call done with no parameter to indicate that it() is done()
					} catch( e ) {
						done( e ); // failure: call done with an error Object to indicate that it() failed
					}					
				});
			} catch(e){
				done(e);
			}
		});
 	});
	
	it('should return NOT_FOUND whentrying to remove non-existent tag assignment', function(done) { 
		tag.unassignTag('IDONTEXIST','4CCS2DBS', function(err){
			try {
				assert.isNotNull(err);
				assert(err.message, "NOT_FOUND");
				done();
			} catch(e){
				done(e);
			}
		});
 	});

	
	it('should add tag assignments from a csv file', function(done) {
       var results = [{"ModuleID": "5SSMN210", "TagName": "BSc"},
	   				  {"ModuleID": "5SSMN210", "TagName": "BSc Computer Science with Management"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Business Intelligence Manager"},
					  {"ModuleID": "5SSMN210", "TagName": "Business Intelligence Manager"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Data Architect"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Data Architect"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Maths"},
					  {"ModuleID": "5CCS1INS", "TagName": "Maths"},
					  {"ModuleID": "5CCS2OSC", "TagName": "Software Engineer"},
					  {"ModuleID": "5CCS2SEG", "TagName": "Software Engineer"},
					  {"ModuleID": "5CCS1INS", "TagName": "System Analyst"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Year 1"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Year 1"},
					  {"ModuleID": "5CCS2SEG", "TagName": "Year 2"},
					  {"ModuleID": "5SSMN210", "TagName": "Year 2"}];

		tag.addBulkAssignTagDataInfile('./test/sampledata/sampleassignmentstags.csv', function(err,rows){
			try{
				assert.isNull(err);
				connection.query('SELECT * FROM ModuleTag', function(err,result){ 
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


	it('should add tag assignments by data insertion', function(done) {
       var results = [{"ModuleID": "5SSMN210", "TagName": "BSc"},
	   				  {"ModuleID": "5SSMN210", "TagName": "BSc Computer Science with Management"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Business Intelligence Manager"},
					  {"ModuleID": "5SSMN210", "TagName": "Business Intelligence Manager"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Data Architect"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Data Architect"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Maths"},
					  {"ModuleID": "5CCS1INS", "TagName": "Maths"},
					  {"ModuleID": "5CCS2OSC", "TagName": "Software Engineer"},
					  {"ModuleID": "5CCS2SEG", "TagName": "Software Engineer"},
					  {"ModuleID": "5CCS1INS", "TagName": "System Analyst"},
					  {"ModuleID": "4CCS1FC1", "TagName": "Year 1"},
					  {"ModuleID": "4CCS2DBS", "TagName": "Year 1"},
					  {"ModuleID": "5CCS2SEG", "TagName": "Year 2"},
					  {"ModuleID": "5SSMN210", "TagName": "Year 2"}];
		
		tag.addBulkAssignTagDataInsert('./test/sampledata/sampleassignmentstags.csv', 
			function(err,rows){
				try{
					assert.isNull(err);
					connection.query('SELECT * FROM ModuleTag', function(err,result){ 
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

	
	it('should add tag data from csv file', function(done) {
    	var results = [ { "Category": "Careers", "TagName": "Astrology"},
						{ "Category": "Type of Degree", "TagName": "BSc"},
        				{ "Category": "Degree", "TagName": "BSc Computer Science"},
        				{ "Category": "Degree", "TagName": "BSc Computer Science with Management"},
       					{ "Category": "Careers", "TagName": "Business Intelligence Manager"},
     					{ "Category": "Skills", "TagName": "Communication"},
        				{ "Category": "Computers", "TagName": "Computing"},
        				{ "Category": "Careers", "TagName": "Data Architect"},
        				{ "Category": null, "TagName": "DeleteTag"},
        				{ "Category": "Careers", "TagName": "Internet"},
        				{ "Category": "Skills", "TagName": "Maths"},
        				{ "Category": null, "TagName": "MSc"},
        				{ "Category": "Degree", "TagName": "MSci Computer Science"},
        				{ "Category": "Careers", "TagName": "Physicist"},
       					{ "Category": "Computers", "TagName": "Software"},
						{ "Category": "Careers", "TagName": "Software Engineer"},
					    { "Category": "Careers", "TagName": "System Analyst"},
					    { "Category": null, "TagName": "Year 1"},
					    { "Category": null, "TagName": "Year 2"},
					    { "Category": null, "TagName": "Year 3"}];
		
		tag.addBulkTagDataInfile('./test/sampledata/sampletags.csv', 
			function(err,rows){
				try{
					assert.isNull(err);
					connection.query('SELECT * FROM Tag', function(err,result){ 
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

	it('should add tag data in bulk', function(done) {
		var results = [ { "Category": "Careers", "TagName": "Astrology"},
							{ "Category": "Type of Degree", "TagName": "BSc"},
							{ "Category": "Degree", "TagName": "BSc Computer Science"},
							{ "Category": "Degree", "TagName": "BSc Computer Science with Management"},
							{ "Category": "Careers", "TagName": "Business Intelligence Manager"},
							{ "Category": "Skills", "TagName": "Communication"},
							{ "Category": "Computers", "TagName": "Computing"},
							{ "Category": "Careers", "TagName": "Data Architect"},
							{ "Category": null, "TagName": "DeleteTag"},
							{ "Category": "Careers", "TagName": "Internet"},
							{ "Category": "Skills", "TagName": "Maths"},
							{ "Category": null, "TagName": "MSc"},
							{ "Category": "Degree", "TagName": "MSci Computer Science"},
							{ "Category": "Careers", "TagName": "Physicist"},
							{ "Category": "Computers", "TagName": "Software"},
							{ "Category": "Careers", "TagName": "Software Engineer"},
							{ "Category": "Careers", "TagName": "System Analyst"},
							{ "Category": null, "TagName": "Year 1"},
							{ "Category": null, "TagName": "Year 2"},
							{ "Category": null, "TagName": "Year 3"}];
		
		tag.addBulkTagDataInsert('./test/sampledata/sampletags.csv', 
			function(err,rows){
				try{
					assert.isNull(err);
					connection.query('SELECT * FROM Tag', function(err,result){ 
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
				var tag = proxyquire('../../server/models/tags.js', {'../config/connect_db.js': {
					getConnection: function(callback){ callback(new Error('MY_CONNECTION_ERROR'));}
				}});
				async.parallel([function(callback){tag.getCategories(function(err){callback(null,err);});},
											 function(callback){tag.getTags(function(err){callback(null,err);});},
											 function(callback){tag.selectTags('moduleID', function(err){callback(null,err);});},
											 function(callback){tag.createTag('tagname', 'category', function(err){callback(null,err);});},
											 function(callback){tag.updateTag('tagname', 'newtagname', 'newcategory',function(err){callback(null,err);});},
											 function(callback){tag.deleteTag('tagname', function(err){callback(null,err);});},
											 function(callback){tag.getAssigned(null, function(err){callback(null,err);});},
											 function(callback){tag.assignTag('tagname', 'moduleID', function(err){callback(null,err);});},
											 function(callback){tag.addBulkAssignTagDataInfile('filePath', function(err){callback(null,err);});},
											 function(callback){tag.addBulkAssignTagDataInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});},
											 function(callback){tag.unassignTag('tagname', 'moduleID', function(err){callback(null,err);});},
											 function(callback){tag.addBulkTagDataInfile('filePath', function(err){callback(null,err);});},
											 function(callback){tag.addBulkTagDataInsert('./test/sampledata/sampledegreesrecommendations.csv', function(err){callback(null,err);});}],
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
