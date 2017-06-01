var fs = require('fs');
var express = require('express');
var validator = require('express-validator');
var modules = require('./models/modules.js');
var tags = require('./models/tags.js');
var users = require('./models/user.js');
var degrees = require('./models/degrees.js');
var bodyParser = require('body-parser');
var express = require('express');
var session = require('express-session');
var async = require('async');
var upload = require('multer')({dest: './uploads/'}); 
var validationConf = require('./config/validation.js');
var util = require('util');


module.exports = function(app, passport) {
	
	app.use(express.static('app'));
	app.use('/bower_components', express.static('bower_components'));
	
	
	var guestAuth = function(req,res,next){
		if(req.user) return next();
		req.session.save((err)=>
			users.createGuest(req.sessionID, (err, user)=>{
				if(err) {console.error(err);
								 res.sendStatus(500);}
				else req.logIn(user, next);
			})
		);
	}
	app.use(guestAuth);
	
	var authLevel = function(accessGroup) {
	  return function(req, res, next) {    
			if(req.user.AccessGroup <= accessGroup) next();
			else res.sendStatus(401);
	  };
	};
	
	var validateSchemas = function(schemas){
		return function(req,res,next){
			schemas.forEach((schema)=>req.check(schema));
			req.getValidationResult().then(function(result) {
				if (!result.isEmpty()) {
					res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
				}else next();
  		});	
			
		};
		
	}
	
	var validateSchemasIf = function(condition, schemas){
		return function(req,res,next){
			if(!condition(req)) return next();
			schemas.forEach((schema)=>req.check(schema));
			req.getValidationResult().then(function(result) {
				if (!result.isEmpty()) {
					res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
				}else next();
  		});	
			
		};
		
	}
	
	var validateContentType = function(req, res, next){
		if(req.header('x-insert-type') == 'BULK') return next();
		req.checkHeaders('content-type', 'Content type should be application/json when x-insert-type header is not BULK').contains('application/json');
		req.getValidationResult().then(function(result) {
			if (!result.isEmpty()) {
				res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
			}else next();
		});
	};
	
	
	var validateUserID = function (req,res, source, callback){
		if(source == 'BODY'){ 
			req.checkBody('userID', 'Must provide only one string ID').isString();
			req.getValidationResult().then(function(result) {
				if (!result.isEmpty()) {
					res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
					callback(false);
				}else callback(true);
			});
		}else callback(true);
	}
	
	var requestFor = function(type, source) {
	  switch(type){
			case 'USER|ADMIN':
				return function(req,res,next){					
					var userID = req.params.userID;				
					if(req.user.UserID == userID || req.user.AccessGroup == 0) return next();
					res.sendStatus(401); 
					
				};
				
			case 'BUILDOWNER':
				return function(req, res, next) {
					degrees.getOwner(req.params.buildID, (err,userID)=>{
							if(err){
								if(err.message == 'BUILD_DOESN\'T_EXIST'){
						 			res.statusMessage ='Build doesn\'t exist';
						 			res.sendStatus(404);
								}else {
								 console.error(err);
								 res.sendStatus(500);
								}
							}else if(userID == req.user.UserID) next();
							else res.sendStatus(401);
					});
	  		};
				
			default:
				return function(req,res,next){
					var userID = (source == 'BODY'?req.body.userID : req.params.userID);
					validateUserID(req,res,source, (valid)=>{
						if(!valid) return;
						if(req.user.UserID == userID) return next();
						res.sendStatus(401); 
					});
				};
		}
	};

	
	
	var validateToken = function(req,res,next){
		users.validateToken(req.body.token, function(err, isValid, userID){
			if(err){
						console.error(err);
						res.sendStatus(500);
			}else if(isValid){
				req.body.userID = userID;
				next();
			}
			else { 
				res.statusMessage = 'Token invalid or expired';
				res.sendStatus(401);
			} 
		});	
	};
	
	var deleteTempFile = function(path){
		fs.unlink(path, (err) => {
			console.log('Successfully deleted '+path+'if error is null/undefined: '+ err);
		});
	}

	// REST API routes
	

	// Modules //// *************************************************************************************************************************************************************
	
	/**
	 * @api {get} /api/modules Select modules depending on filters given.
	 * @apiDescription If filters are not specified selects all modules available.
	 * The filters should be specified in the query.
	 * @apiExample Example usage : 
	 *	/api/modules?credits=15&module_name=Accounting&year=2&per_page=10
	 * @apiName GetModules
	 * @apiGroup Modules
	 *
	 * @apiParam {int} credits Credits wanted for modules.
	 * @apiParam {string} module_name Module name.
	 * @apiParam {string} day Day of lecture.
	 * @apiParam {int} year Year module takes place ex: Year 2.
	 * @apiParam {string} time_range Range of time in which module could take place ex: 100000:130000.
	 * @apiParam {string} tag Tags associated to module ex: BSc.
	 * @apiParam {string} faculty Faculty of the module ex: Informatics.
	 * @apiParam {int} coursework_percentage Coursework percentage of module.
	 * @apiParam {int} per_page Number of module results per page.
	 * @apiParam {int} page Page number.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK, Name: Accounting, LectureDay : Monday, Credits: 15...
	 * 
 	 *
	 */
	app.get("/api/modules", validator(validationConf.FILTER_VALIDATOR_OPTIONS), validateSchemas([validationConf.FILTER_SCHEMA]), function(req,res){ 
		var filters={};
		filters.credits = req.query.credits;
		filters.moduleName = req.query.module_name;
		filters.lectureDays = req.query.day;
		filters.year = req.query.year;
		filters.range = req.query.time_range;
		filters.tags = req.query.tag;
		filters.faculty = req.query.faculty;
		filters.courseworkPercentage = req.query.coursework_percentage;
		var pagination = {};
		pagination.perPage = req.query.per_page;
		pagination.pageNum = req.query.page;
		if(!(filters.credits || filters.year || filters.moduleName || filters.lectureDays || filters.range || filters.tags || filters.faculty || filters.coursework_percentage)){
			modules.selectAll(pagination, function(err, data){
				if(err){
					console.error(err);
					res.sendStatus(500);
				}
				else res.send(data);
			});
		}else{
			modules.selectFiltered(pagination, filters, function(err, data){
				if(err){
					console.error(err);
					res.sendStatus(500);
				}
				else res.send(data);
			});	
		}
	});
	
	/**
	 * @api {get} /api/modules/tags Get the tags assigned to the given module(s) .
	 * @apiDescription The moduleID(s) should be specified in the query.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/tags?module=5CCS2SEG&module=6CCS2JUL
	 * @apiName GetModulesTags
	 * @apiGroup Tags
	 *
	 * @apiParam {string} module The moduleID(s) of the module(s) wanted. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK, TagName : BSc , Category : Degree...
	 * 
 	 *
	 */
	app.get("/api/modules/tags", function(req,res){ 
		tags.getAssigned(req.query.module, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			}
			else res.send(data);
		});
	});
	
	/**
	 * @api {get} /api/modules/faculties Get the distinct faculties that the given module(s) are assigned to.
	 * @apiDescription The moduleID(s) should be specified in the query.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/faculties
	 * @apiName GetModuleFaculties
	 * @apiGroup Modules
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK, Faculty : Informatics, Faculty : Geography...
	 * 
 	 *
	 */
	app.get("/api/modules/faculties", function(req,res){ 
		modules.getModulesByFaculty(function(err,data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			}
			else res.send(data);
		});
	});
	
	/**
	 * @api {get} /api/modules/:moduleID Get all available information on a module.
	 * @apiDescription The moduleID should be specified in the parameters.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/5CCS2SEG
	 * @apiName GetModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} moduleID ID of the wanted module.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK, ModuleID : 5CCS2SEG, ModuleName: Software Engineering, Faculty: Informatics...
	 * 
	 * @apiError NOT_FOUND The module specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
 	 *
	 */
	app.get("/api/modules/:moduleID", function(req,res){
		modules.getModule(req.params.moduleID, function(err, data){
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			}
			else res.send(data);
		});	
	});

	/**
	 * @api {put} /api/modules/:moduleID Update information on a module.
	 * @apiDescription The moduleID should be specified in the parameters. Can change one or more elements.
	 * The new moduleID, moduleName, description, year, credits, lecture day, lecture time, coursework percentage and faculty should be specified in the body of the request.
	 * @apiExample Example usage : 
	 *	/api/modules/5CCS2SEG 
	 * { moduleName : "Software Engineering", 
	 *   lectureDay : "Monday", ...} in json format.
	 * @apiName UpdateModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} moduleID ID of the module being updated.
	 * @apiParam {string} moduleID ID of the new module or the same.
	 * @apiParam {string} module_name Module name.
	 * @apiParam {string} description Description of module.
	 * @apiParam {int} year Year module takes place ex: Year 2.
	 * @apiParam {int} credits Credits wanted for modules
	 * @apiParam {string} day Day of lecture.
	 * @apiParam {string} time_range Range of time in which module could take place ex: 100000:130000.
	 * @apiParam {int} coursework_percentage Coursework percentage of module.
	 * @apiParam {string} faculty Faculty of the module ex: Informatics.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * 
	 * @apiError NOT_FOUND The module specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
 	 *
	 */	
	app.put("/api/modules/:moduleID", bodyParser.json(), authLevel(1), validator(validationConf.MODULE_VALIDATOR_OPTIONS), validateSchemas([validationConf.MODULE_SCHEMA]),
		function(req,res){ 
			modules.updateModule(req.params.moduleID, req.body.moduleID, req.body.moduleName, req.body.description, req.body.year, req.body.credits, 
													 req.body.lectureDay, req.body.lectureTime, req.body.courseworkPercentage, req.body.faculty,
			 function(err, data){
				if(err){
					if(err.message == 'NOT_FOUND') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
				} else res.sendStatus(204);
			});	
	});


	/**
	 * @api {post} /api/modules Add a new module by bulk upload or one by one.
	 * @apiDescription The header x-insert-type must be specified to be BULK for bulk uploading, otherwise will by default use the one by one add method. If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. 
	 * The moduleID, moduleName, description, year, credits, lecture day, lecture time, coursework percentage and faculty should be specified in the body of the request if not bulk uploading.
	 * @apiExample Example usage : 
	 *	/api/modules 
	 * { moduleName : "Software Engineering", 
	 *   lectureDay : "Monday", ...} in json format.
	 * @apiName AddModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} moduleID ID of the module being updated.
	 * @apiParam {string} moduleID ID of the new module or the same.
	 * @apiParam {string} module_name Module name.
	 * @apiParam {string} description Description of module.
	 * @apiParam {int} year Year module takes place ex: Year 2.
	 * @apiParam {int} credits Credits wanted for modules
	 * @apiParam {string} day Day of lecture.
	 * @apiParam {string} time_range Range of time in which module could take place ex: 100000:130000.
	 * @apiParam {int} coursework_percentage Coursework percentage of module.
	 * @apiParam {string} faculty Faculty of the module ex: Informatics.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 * 
	 * @apiError ERR_DUP_ENTRY The module already exists.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
 	 *
	 */	
	app.post("/api/modules", bodyParser.json(), authLevel(1), validator(validationConf.MODULE_VALIDATOR_OPTIONS), validateContentType,
		validateSchemasIf((req)=>{return req.header('x-insert-type') != 'BULK'}, [validationConf.MODULE_SCHEMA]), upload.single('batch'), function(req,res){ 
			if(req.header('x-insert-type') != 'BULK')
				modules.addModule(req.body.moduleID, req.body.moduleName, req.body.description, req.body.year, req.body.credits,
													req.body.lectureDay, req.body.lectureTime, req.body.courseworkPercentage, req.body.faculty,
				 function(err){		
					if(err){
						if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
						else{
							console.error(err);
							res.sendStatus(500);
						}
					}else{
						res.setHeader('Location', '/api/modules/'+req.body.moduleID);
						res.sendStatus(201);
					}
				});
			else if(!req.file) res.status(400).send('File not transfered');
			else {
				var addBulkModuleData = (process.env.LOAD_LOCAL_INFILE==='true')?modules.addBulkModuleDataInfile:modules.addBulkModuleDataInsert;
				addBulkModuleData(req.file.path, function(err){		
					if(err){
						res.sendStatus(500);
						console.log(err);
					} else res.sendStatus(201);
					deleteTempFile(req.file.path);
				});	
			}
	});

	/**
	 * @api {delete} /api/modules/:moduleID Delete a module.
	 * @apiDescription The moduleID should be specified in the parameters. Can change one or more elements.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/5CCS2SEG 
	 * @apiName DeleteModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} moduleID ID of the module to delete.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * 
	 * @apiError NOT_FOUND The module specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
 	 *
	 */	
	app.delete("/api/modules/:moduleID", authLevel(1), function(req,res){
		 modules.removeModule(req.params.moduleID, function(err, data){
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(204);
		});	
	});
	

	// Tracked Modules //// *******************************************************************************************************************************************************
	
	
	/**
	 * @api {get} /api/users/:userID/modules/ Select tracked modules depending on filters given.
	 * @apiDescription If filters are not specified selects all modules available.
	 * The filters should be specified in the query.
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk/modules?credits=15&module_name=Accounting&year=2&per_page=10
	 * @apiName FilterTrackedModules
	 * @apiGroup Modules
	 *
	 * @apiParam {int} credits Credits wanted for modules.
	 * @apiParam {string} module_name Module name.
	 * @apiParam {string} day Day of lecture.
	 * @apiParam {int} year Year module takes place ex: Year 2.
	 * @apiParam {string} time_range Range of time in which module could take place ex: 100000:130000.
	 * @apiParam {string} tag Tags associated to module ex: BSc.
	 * @apiParam {string} faculty Faculty of the module ex: Informatics.
	 * @apiParam {int} coursework_percentage Coursework percentage of module.
	 * @apiParam {int} per_page Number of module results per page.
	 * @apiParam {int} page Page number.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK, Name: Accounting, LectureDay : Monday, Credits: 15...
	 * 
 	 *
	 */
	app.get("/api/users/:userID/modules/", validator(validationConf.FILTER_VALIDATOR_OPTIONS), validateSchemas([validationConf.FILTER_SCHEMA]), function(req,res){ 
		var filters={};
		filters.credits = req.query.credits;
		filters.moduleName = req.query.module_name;
		filters.lectureDays = req.query.day;
		filters.year = req.query.year;
		filters.range = req.query.time_range;
		filters.tags = req.query.tag;
		filters.faculty = req.query.faculty;
		filters.courseworkPercentage = req.query.coursework_percentage;
		var pagination = {};
		pagination.perPage = req.query.per_page;
		pagination.pageNum = req.query.page;
		
		if(!(filters.credits || filters.year || filters.moduleName || filters.lectureDays || filters.range || filters.tags || filters.faculty || filters.couresework_percentage)){
			modules.returnTrackedModules(req.params.userID, pagination, function(err, data){
				if(err){
					console.error(err);
					res.sendStatus(500);
				}
				else res.send(data);
			});
		}else{
			modules.returnFilteredTrackedModules(req.params.userID, pagination, filters, function(err, data){
				if(err){
					console.error(err);
					res.sendStatus(500);
				}
				else res.send(data);
			});	
		}
	});

	/**
	 * @api {post} /api/users/modules Tracks a module.
	 * @apiDescription The moduleID, userID and tagArray should be specified in the body of the request in json form. TagArray is optional.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/modules
	 * { tagArray : ["BSc","Careers"],  moduleID : "5CCS2OSC", userID : "studentemail@kcl.ac.uk"}
	 * @apiName AddTrackedModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} tagArray Tags used to find the module.
	 * @apiParam {string} moduleID ID of the module to track.
	 * @apiParam {string} userID User's email.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 *
	 * @apiError NOT_FOUND The module specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 * 
	 * @apiError ERR_DUP_ENTRY The module is already tracked.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
 	 *
	 */			
	app.post("/api/users/modules/", bodyParser.json(), authLevel(2), validator(validationConf.TRACKING_VALIDATOR_OPTIONS), validateSchemas([validationConf.TRACKING_SCHEMA]),
		requestFor('USER', 'BODY'), function(req,res){ //TODO ADD 404 BRANCH
		async.parallel( [(callback)=>{ if(req.body.tagArray) modules.countTracking(req.body.tagArray, req.body.moduleID, callback);
																	 else callback(null);
																 },
										(callback)=>{modules.addTrackedModules(req.body.moduleID, req.body.userID, callback);}],
										function(err){
											if(err){
												if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
												else{
													console.error(err);
													res.sendStatus(500);
												}
											}else{
												res.setHeader('Location', '/api/users/' + req.body.userID + '/modules');			
												res.sendStatus(201);
											}
										}
		);	

	});

	/**
	 * @api {delete} /api/users/:userID/modules/:moduleID Delete a tracked module.
	 * @apiDescription The moduleID and userID should be specified in the parameters.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk/modules/5CCS2OSC
	 * @apiName DeleteTrackedModule
	 * @apiGroup Modules
	 *
	 * @apiParam {string} moduleID ID of the tracked module.
	 * @apiParam {string} userID User's email.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * 
	 * @apiError NOT_FOUND The module specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
 	 *
	 */	
	app.delete("/api/users/:userID/modules/:moduleID", authLevel(2), requestFor('USER', 'PARAMS'), function(req,res){
		 modules.removeTrackedModules(req.params.moduleID, req.params.userID, function(err, data){
			if(err) {
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else {	
					console.error(err); 
					res.sendStatus(500);
				}
			}
			else res.sendStatus(204);
		});	
	});
	

	// Recommendations //// ******************************************************************************************************************************************************
	
	/**
	 * @api {get} /api/users/:userID/modules/recommended Get recommended modules.
	 * @apiDescription The tag(s) and number of wanted recommendations should be specified in the query, and the userID in the parameters.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk/modules/recommended?tag=BSc&tag=Careers&wanted=2
	 * @apiName GetRecommendations
	 * @apiGroup Modules
	 *
	 * @apiParam {string} userID User's email.
	 * @apiParam {string} tag Tag or tags wanted for recommendations.
	 * @apiParam {int} wanted Number of wanted recommendations.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
 	 *
	 */	
	app.get("/api/users/:userID/modules/recommended/", validator(), validateSchemas([validationConf.RECOMMENDATION_SCHEMA]), function(req,res){  
		modules.getRecommended(req.query.tag, req.params.userID, req.query.wanted,function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			}
			else res.send(data);
		});	
	});


	// Feedback ////******************************************************************************************************************************************************

	/**
	 * @api {post} /api/users/feedback  Add feedback.
	 * @apiDescription Add feedback. Each rating is between 1 and 5, where 5 is the best. All data should be sent in the body.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/feedback
	 * { "usefulness" : 4, "usability" : 5... }
	 * @apiName AddFeedback
	 * @apiGroup User
	 *
	 * @apiParam {int} usefulness - Number between 1 and 5.
	 * @apiParam {int} usability - Number between 1 and 5.
     * @apiParam {int} informative - Number between 1 and 5.
 	 * @apiParam {int} security - Number between 1 and 5.
 	 * @apiParam {int} acessibility - Number between 1 and 5.
 	 * @apiParam {string} reasons - The user's reasons for leaving.
 	 * @apiParam {string} comments - The user's comments.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
 	 *
	 */	
	app.post("/api/users/feedback", bodyParser.json(), authLevel(2), validator(validationConf.FEEDBACK_VALIDATOR_OPTIONS), validateSchemas([validationConf.FEEDBACK_SCHEMA]),
		function(req,res){ 
			users.addFeedback(req.body.usefulness, req.body.usability, req.body.informative, req.body.security, req.body.accessibility, 
												req.body.reasons, req.body.comments, function(err,data){
				if(err) {
					console.error(err);
					res.sendStatus(500);
				}
				else res.sendStatus(200);
			});
	});

	/**
	 * @api {get} /api/users/feedback Retrieve feedback.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/feedback
	 *
	 * @apiName GetFeedback
	 * @apiGroup User
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK FeedbackID : 1, Ratings : Usability : 5, Usefulness : 4 ...
 	 *
	 */	
	app.get("/api/users/feedback", authLevel(1), function(req,res){ 
		users.getFeedback(function(err,data){
			if(err) {
				console.error(err);
				res.sendStatus(500);
			}
			else res.send(data);
		});
	});

	/**
	 * @api {delete} /api/users/feedback Delete feedback.
	 * @apiDescription Delete all feedback up to a given date. If no date is given deletes all feedback.The date should be in the query.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/feedback.before_date=2017-03-05
	 *
	 * @apiName DeleteFeedback
	 * @apiGroup User
	 *
	 * @apiParam {string} before_date - Date in the form yyyy-mm-dd.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 *
	 * @apiError NOT_FOUND The date specified was not found.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
 	 *
	 */	
	app.delete("/api/users/feedback", authLevel(1), validator(), validateSchemas([validationConf.DATE_SCHEMA]), function(req,res){ 
		users.clearFeedback(req.query.before_date, function(err,data){
			if(err) {
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else {	
					console.error(err); 
					res.sendStatus(500);
				}
			}
			else res.sendStatus(204);
		});
	});


	// Users //// ****************************************************************************************************************************************************************
	
   /**
	 * @api {get} /api/users Get the users by access group.
	 * @apiDescription Can specify multiple access groups, one access group or nothing. If nothing is specified retrieves all users. Only administrators can use this.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users?access_group=0&access_group=2
	 *
	 * @apiName GetUsers
	 * @apiGroup User
	 *
	 * @apiParam {string} access_group - The access level of users wanted : 0 for administrators, 1 for moderators or 2 for students.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
 	 *
	 */	
	app.get("/api/users", authLevel(0), validator(validationConf.GROUP_OPTIONS), validateSchemas([validationConf.GROUP_SCHEMA]), function(req,res){ 
		users.getUsers(req.query.access_group, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			}
			else res.send(data);
		});
	});
	

   /**
	 * @api {post} /api/users Add users.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users
	 * { userID : "david.smith@gmail.com", fName : "David", lName : "Smith", password : "password"} in json form.
	 *
	 * @apiName AddUsers
	 * @apiGroup User
	 *
	 * @apiParam {string} userID - The user's email.
	 * @apiParam {string} fName - The user's first name.
	 * @apiParam {string} lName - The user's last name. 
	 * @apiParam {string} password - The user's password.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 * @apiError USER_EXISTS The user already exists or the email is taken.
	 * @apiErrorExample :
	 * HTTP/1.1 409 User Exists
	 */	
	app.post("/api/users", bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_SCHEMA]), function(req,res){ 
		users.addUser(req.body.userID, req.body.fName, req.body.lName, req.body.password, 2, function(err, data){		
			if(err){
				if(err.message == 'USER_EXISTS') res.sendStatus(409);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			}	else{
				res.setHeader('Location', '/api/users/'+req.body.userID);
				res.sendStatus(201);
			}
		});	
	});
	
   /**
	 * @api {put} /api/users/:userID Update a user.
	 * @apiDescription Can update one or more values. The old userID must be passed in the parameters.
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk
	 * { userID : "david.smith@gmail.com", fName : "David", lName : "Smith", password : "password"} in json form.
	 *
	 * @apiName UpdateUsers
	 * @apiGroup User
	 *
	 * @apiParam {string} userID - The user's new email or old email.
	 * @apiParam {string} fName - The user's first name.
	 * @apiParam {string} lName - The user's last name. 
	 * @apiParam {string} password - The user's password.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 * @apiError USER_EXISTS The user already exists or the email is taken.
	 * @apiErrorExample :
	 * HTTP/1.1 409 User Exists
	 */	
	app.put("/api/users/:userID", bodyParser.json(), authLevel(2), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_UPDATE_SCHEMA]),
		requestFor('USER', 'PARAMS'), function(req,res){ 
			users.updateUser(req.params.userID, req.body.userID, req.body.fName, req.body.lName, function(err){		
				if(err){
					console.error(err);
					res.sendStatus(500);
				}	else{
					res.setHeader('Location', '/api/users/'+req.body.userID);
					res.sendStatus(200);
				}
			});	
	});


   /**
	 * @api {delete} /api/users/:userID Delete a user.
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk
	 *
	 * @apiName DeleteUsers
	 * @apiGroup User
	 *
	 * @apiParam {string} userID - The user's email.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */	
	app.delete("/api/users/:userID", authLevel(2), requestFor('USER|ADMIN'), function(req, res, next){
		users.deleteUser(req.params.userID, function(err,data){		
			if(err){ console.log(err); res.sendStatus(500);}
			else{
				req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
				res.cookie(
						'connect.sid', 
						req.cookies["connect.sid"], 
						{
								maxAge: req.session.cookie.maxAge,
								expires: req.session.cookie.expires,
								path: '/', 
								httpOnly: true
						}

				);
				next();
			}
		});
	}, guestAuth, function(req,res){
		res.cookie('selector_user', req.user, {maxAge: req.session.cookie.maxAge, expires: req.session.cookie.expires, httpOnly: false});
		res.sendStatus(204);
					
	});	

	
	// Tags	//// ******************************************************************************************************************************************************
	
   /**
	 * @api {get} /api/tags/categories Get the distinct categories of tags.                                                
	 * 
	 * @apiExample Example usage : 
	 *	/api/tags/categories
	 *
	 * @apiName GetTagCategories
	 * @apiGroup Tags
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK Category : Careers, Category : Degree...
	 *
	 */	
	app.get("/api/tags/categories",function(req,res){ 
		tags.getCategories(function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});
	});
	
   /**
	 * @api {get} /api/tags/ Get all the tags.                                                
	 * 
	 * @apiExample Example usage : 
	 *	/api/tags
	 *
	 * @apiName GetTags
	 * @apiGroup Tags
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK TagName : BSc, Category : Careers ...
	 *
	 */	
	app.get("/api/tags",function(req,res){ 
		tags.getTags(function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});
	});
	

 /**
	 * @api {post} /api/tags Add tags one by one or by bulk upload.                                                
	 * @apiDescription If the header x-insert-type is set to BULK, the tags will be uploaded in bulk with the chosen csv file. Otherwise, the tagName and category 
	 * have to be specified in the body in json form. If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. 
	 * @apiExample Example usage : 
	 *	/api/tags
	 * {tagName : "BSc" , category : "Degree"}
	 *
	 * @apiName AddTags
	 * @apiGroup Tags
	 *
	 * @apiParam {string} tagName The name of the tag. 
	 * @apiParam {string} category The category of the tag. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 *
	 * @apiError ER_DUP_ENTRY The tag already exists.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
	 */	
	app.post("/api/tags", bodyParser.json(), authLevel(1), validator(), validateContentType, 
		validateSchemasIf((req)=>{return req.header('x-insert-type') != 'BULK'}, [validationConf.TAG_SCHEMA]), upload.single('batch'), function(req,res){ 
			if(req.header('x-insert-type') != 'BULK')
				tags.createTag(req.body.tagName, req.body.category, function(err, data){		
					if(err){
							if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
							else{
								console.error(err);
								res.sendStatus(500);
							}
					}else {
						res.setHeader('Location', '/api/tags/'+ req.body.tagName);
						res.sendStatus(201);
					}
				});
			else if(!req.file) res.status(400).send('File not transfered');
			else{
				var addBulkTagData = (process.env.LOAD_LOCAL_INFILE==='true')?tags.addBulkTagDataInfile:tags.addBulkTagDataInsert;
				addBulkTagData(req.file.path, function(err){		
					if(err){
						res.sendStatus(500);
						console.log(err);
					} else res.sendStatus(201);
					deleteTempFile(req.file.path);
				});
			}
	});

   /**
	 * @api {put} /api/tags/:tagName Update a tag.                                                
	 * @apiDescription If the header x-insert-type is set to BULK, the tags will be uploaded in bulk with the chosen csv file. Otherwise, the new tagName and category 
	 * have to be specified in the body in json form and the old tagName as a parameter of the route. If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. 
	 * @apiExample Example usage : 
	 *	/api/tags/BSc
	 * {tagName : "MSci" , category : "Degree"}
	 *
	 * @apiName UpdateTags
	 * @apiGroup Tags
	 *
	 * @apiParam {string} tagName The name of the tag. 
	 * @apiParam {string} category The category of the tag. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 *
	 * @apiError NOT_FOUND The tag doesn't exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */	
	app.put("/api/tags/:tagName", bodyParser.json(), authLevel(1), validator(), validateSchemas([validationConf.TAG_SCHEMA]), function(req,res){
		tags.updateTag(req.params.tagName, req.body.tagName, req.body.category, function(err, data){		
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{ 
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(204);
		});	
	});

	/**
	 * @api {delete} /api/tags/:tagName Delete a tag.                                                
	 * @apiDescription Specify the tagName of the tag to be deleted as a parameter. 
	 * 
	 * @apiExample Example usage : 
	 *	/api/tags/BSc
	 *
	 * @apiName DeleteTags
	 * @apiGroup Tags
	 *
	 * @apiParam {string} tagName The name of the tag. 
	 * @apiParam {string} category The category of the tag. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 *
	 * @apiError NOT_FOUND The tag doesn't exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */	
	app.delete("/api/tags/:tagName", authLevel(1), function(req,res){ 
		tags.deleteTag(req.params.tagName, function(err, data){		
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(204);
		});	
	});
	
	/**
	 * @api {get} /api/modules/:moduleID/tags Retrieve the tags associated to a given module.                                                
	 * @apiDescription Specify the moduleID of the module wanted as a parameter. 
	 * 
	 * @apiExample Example usage : 
	 *	 /api/modules/5CCS2SEG/tags
	 *
	 * @apiName GetModuleTags
	 * @apiGroup Tags
	 *
	 * @apiParam {string} moduleID The ID of the module. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */
	app.get("/api/modules/:moduleID/tags", function(req,res){
		tags.selectTags(req.params.moduleID, function(err, data){		
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});	
	});	

	/**
	 * @api {post} /api/modules/tags Assign tags to modules in bulk.                                                
	 * @apiDescription Will upload assignments from a csv file. If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. Have to add a mutlipart form data containing file field named batch.
	 * 
	 * @apiExample Example usage : 
	 *	 /api/modules/tags
	 *
	 * @apiName AddTagAssignments
	 * @apiGroup Tags
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 *
	 */
	app.post("/api/modules/tags", authLevel(1), upload.single('batch'), function(req,res){ 
		if(!req.file) res.status(400).send('File not transfered');
		else{
			var assignBulkTagData = (process.env.LOAD_LOCAL_INFILE==='true')?tags.addBulkAssignTagDataInfile:tags.addBulkAssignTagDataInsert;
			assignBulkTagData(req.file.path, function(err){		
				if(err){
					res.sendStatus(500);
					console.log(err);
				} else res.sendStatus(201);
				deleteTempFile(req.file.path);
			});	
		}
	});

	
	/**
	 * @api {post} /api/modules/:moduleID/tags Assign tags to modules one by one.                                                
	 * @apiDescription Will upload assignments from a csv file if the file is specified and will use insertion or infile. If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. Have to add a mutlipart form data containing file field named batch.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/5CCS2SEG/tags
	 *
	 * @apiName AddTagAssignments
	 * @apiGroup Tags
	 *
	 * @apiParam {string} tagName The name of the tag.
	 * @apiParam {string} moduleID The ID of the module.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 *
	 * @apiError ER_DUP_ENTRY The tag assignment already exists.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
	 */
	app.post("/api/modules/:moduleID/tags", bodyParser.json(), authLevel(1), validator(), validateSchemas([validationConf.TAG_SCHEMA]), function(req,res){
		tags.assignTag(req.body.tagName, req.params.moduleID, function(err, data){		
			if(err){
					if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
					else if(err.code == 'ER_NO_REFERENCED_ROW_2') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
			}else{
				res.setHeader('Location', '/api/modules/'+ req.body.moduleID + '/tags');
				res.sendStatus(201);
			}
		});	
	});
	
	/**
	 * @api {delete} /api/modules/:moduleID/tags/:tagName Delete tag-module assignment.                                                
	 * @apiDescription Have to specify the tagName and moduleID as parameters in the route.
	 * 
	 * @apiExample Example usage : 
	 *	/api/modules/5CCS2SEG/tags/BSc
	 *
	 * @apiName DeleteTagAssignments
	 * @apiGroup Tags
	 *
	 * @apiParam {string} tagName The name of the tag.
	 * @apiParam {string} moduleID The ID of the module.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 *
	 */
	app.delete("/api/modules/:moduleID/tags/:tagName", authLevel(1), function(req,res){ 
		tags.unassignTag(req.params.tagName, req.params.moduleID, function(err, data){		
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} 
			else res.sendStatus(204);
		});
	});	
	
	
	// Degree routes ////   ******************************************************************************************************************************************************
	
   /**
	 * @api {get} /api/users/:userID/degrees Match a user's preferences to degrees.                                                
	 * @apiDescription Have to specify the userID as parameters in the route.
	 * 
	 * @apiExample Example usage : 
	 *	/api/users/studentemail@kcl.ac.uk/degrees
	 *
	 * @apiName MatchDegrees
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} userID The user's email.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK { DegreeTitle : "Bsc Computer Science"}
	 *
	 */
	app.get("/api/users/:userID/degrees",function(req,res){
		degrees.matchDegrees(req.params.userID, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			}else res.send(data);
		});
	});

   /**
	 * @api {get} /api/degrees/:degreeTitle Get information on a specific degree.                                                
	 * @apiDescription Have to specify the degreeTitle as parameters in the route.
	 * 
	 * @apiExample Example usage : 
	 *	/api/degrees/BSc Computer Science
	 *
	 * @apiName GetDegree
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK { DegreeTitle : "Bsc Computer Science", LengthOfStudy : 3}
	 *
	 */
	app.get("/api/degrees/:degreeTitle", function(req,res){
		degrees.getDegree(req.params.degreeTitle, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});
	});
	
	/**
	 * @api {get} /api/degrees Get information on all degrees.                                                
	 * 
	 * @apiExample Example usage : 
	 *	/api/degrees
	 *
	 * @apiName GetDegrees
	 * @apiGroup Degrees
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK { DegreeTitle : "Bsc Computer Science", LengthOfStudy : 3}, {...
	 *
	 */
	app.get("/api/degrees", function(req,res){ 
		degrees.getDegrees(function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);		
		});
	});
	
 
 /**
	 * @api {post} /api/degrees Add degrees in bulk or one by one.     
	 * @apiDescription Upload degree dependencies in bulk from a csv file or one bye one. If process environment variable infile is set to true data insertion will attempt to use the load data infile local command over inserts. 
	 * Will fail if disabled on mysql server. Will upload in bulk only if the header x-insert-type is set to BULK. Have to add a mutlipart form data containing file field named batch. Otherwise will require degreeTitle and lengthOfStudy 
	 * to be specified in the body in json form. 
	 *
	 * @apiExample Example usage : 
	 *	/api/degrees
	 * { degreeTitle : "BSc Computer Science", lengthOfStudy : 3}
	 *
	 * @apiName AddDegrees
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} lengthOfStudy The length of the degree.
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 * @apiError ER_DUP_ENTRY The tag assignment already exists.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
	 */
	app.post("/api/degrees", bodyParser.json(), authLevel(1), validator(validationConf.DEGREE_OPTIONS), validateContentType,
		validateSchemasIf((req)=>{return req.header('x-insert-type') != 'BULK'}, [validationConf.DEGREE_SCHEMA]),
		upload.single('batch'), function(req,res){ 
			if(req.header('x-insert-type') != 'BULK')
				degrees.addDegree(req.body.degreeTitle, req.body.lengthOfStudy, function(err){
					if(err){
							if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
							else{
								console.error(err);
								res.sendStatus(500);
							}
					}else{
						res.setHeader('Location', '/api/degrees/'+ req.body.degreeTitle);
						res.sendStatus(201);
					}
				});
			else if(!req.file) res.status(400).send('File not transfered');
			else {
				var addBulkDegreeData = (process.env.LOAD_LOCAL_INFILE==='true')?degrees.addBulkDegreeDataInfile:degrees.addBulkDegreeDataInsert;
				addBulkDegreeData(req.file.path, function(err){		
					if(err){
						res.sendStatus(500);
						console.log(err);
					} else res.sendStatus(201);
					deleteTempFile(req.file.path);
				});
			}
	});
	
	/**
	 * @api {put} /api/degrees/:degreeTitle Update a degree.     
	 * @apiDescription Can change one or more elements. Have to specify the old degreeTitle as a parameter, and the new/ old degreeTile and new lengthOfStudy in the body in json form.
	 *
	 * @apiExample Example usage : 
	 *	/api/degrees/BSc Computer Science
	 *
	 * @apiName UpdateDegree
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The new name of the degree or the old name.
	 * @apiParam {string} lengthOfStudy The length of the degree.
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * @apiError NOT_FOUND The degree doesn't exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.put("/api/degrees/:degreeTitle", bodyParser.json(), authLevel(1), validator(validationConf.DEGREE_OPTIONS), validateSchemas([validationConf.DEGREE_SCHEMA]),
		function(req,res){
			degrees.updateDegree(req.params.degreeTitle, req.body.degreeTitle, req.body.lengthOfStudy, function(err){
				if(err){
					if(err.message == 'NOT_FOUND') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
				} else res.sendStatus(204);
			});
	});
	
	/**
	 * @api {delete} /api/degrees/:degreeTitle Delete a degree.     
	 * @apiDescription Can change one or more elements. Have to specify the old degreeTitle as a parameter, and the new/ old degreeTile and new lengthOfStudy in the body in json form.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science
	 *
	 * @apiName DeleteDegree
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The name of the degree to be deleted.
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * @apiError NOT_FOUND The degree doesn't exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.delete("/api/degrees/:degreeTitle", authLevel(1), function(req,res){ 
		degrees.deleteDegree(req.params.degreeTitle, function(err){
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(204);
		});
	});
	
	// Degree Assignments
		
	/**
	 * @api {get} /api/degrees/:degreeTitle/modules/ Get the module assignments of a degree.     
	 * @apiDescription Have to specify the degreeTitle as a parameter.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/
	 *
	 * @apiName GetModuleDegreeAssignments
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The name of the degree.
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK 
	 */
	app.get("/api/degrees/:degreeTitle/modules/", function(req,res){
		degrees.getAssignments(req.params.degreeTitle, function(err, data){
				if(err){
					console.error(err);
					res.sendStatus(500);
				} else res.send(data);
		});
	});	
	
	/**
	 * @api {post} /api/degrees/:degreeTitle/modules/ Add module assignments of a degree.     
	 * @apiDescription Have to specify the degreeTitle as a parameter, and the moduleID, dependentIDArray and recommndedArray in the body in json form.
	 * The dependentIDArray and recommendedIDArray can consist of one or more moduleIDs.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/
	 * {moduleID : "4CCS1DST", isOptional : "0", dependentIDArray : ["4CCS1PEP","4CCS1PRA"], recommendedIDArray : ["4CCS1FC1","6CCS1MAL"]}
	 *
	 * @apiName AddModuleDegreeAssignments
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The name of the degree.
	 * @apiParam {boolean} isOptional Whether the module is optional or not.
	 * @apiParam {string} dependentIDArray The dependent module(s).
	 * @apiParam {string} recommendedIDArray The recommended module(s).
	 *
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created 
	 * @apiError ER_DUP_ENTRY The degree-module assignment already exists.
	 * @apiErrorExample :
	 * HTTP/1.1 409 Duplicate Entry
	 */
	app.post("/api/degrees/:degreeTitle/modules", bodyParser.json(), authLevel(1), validator(validationConf.ASSIGNMENT_OPTIONS), 
		validateSchemas([validationConf.MODULE_ASSIGNMENT_SCHEMA]), function(req,res){ 
			async.series([(done)=>degrees.assignToDegree(req.params.degreeTitle, req.body.moduleID, req.body.isOptional, done),
										(done)=>degrees.addDependencies(req.params.degreeTitle, req.body.moduleID, req.body.dependentIDArray, done),
										(done)=>degrees.addRecommended(req.params.degreeTitle, req.body.moduleID, req.body.recommendedIDArray, done)],
									 function(err){
										if(err){
												if(err.code == 'ER_DUP_ENTRY') res.sendStatus(409);
												else{
													console.error(err);
													res.sendStatus(500);
												}
										}else res.sendStatus(201);
			});
	});

   /**
	 * @api {post} /api/degrees/modules Add module assignments of a degree in bulk.     
	 * @apiDescription Upload degree dependencies in bulk from a csv file. If process environment variable infile is set to true data insertion will attempt to use the load data infile local command over inserts. 
	 * Will fail if disabled on mysql server. Have to add a mutlipart form data containing file field named batch.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/modules/
	 *
	 * @apiName AddModuleDegreeAssignmentsBulk
	 * @apiGroup Degrees
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created 
	 */
	app.post("/api/degrees/modules", authLevel(1),  upload.single('batch'), function(req,res){
		if(!req.file) res.status(400).send('File not transfered');
		else{
			var assignToDegreeBulk = (process.env.LOAD_LOCAL_INFILE==='true')?degrees.assignToDegreeBulkInfile:degrees.assignToDegreeBulkInsert;
			assignToDegreeBulk(req.file.path, function(err){		
				if(err){
					res.sendStatus(500);
					console.log(err);
				} else res.sendStatus(201);
				deleteTempFile(req.file.path);
			});
		}
	});
	
	/**
	 * @api {put} /api/degrees/:degreeTitle/modules/:moduleID Update module-degree assignments.     
	 * @apiDescription Have to specify the degreeTitle and moduleID in the parameters of the route. isOptional has to be in the body in json form.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/5CCS2SEG
	 * { isOptional : "1"}
	 *
	 * @apiName UpdateModuleDegreeAssignmentsBulk
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module ID code.
	 * @apiParam {boolean} isOptional Whether the module is optional or not.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204  
	 * @apiError NOT_FOUND The degree-module assignment does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.put("/api/degrees/:degreeTitle/modules/:moduleID", bodyParser.json(), authLevel(1), validator(), 
		validateSchemas([validationConf.MODULE_ASSIGNMENT_UPDATE_SCHEMA]), function(req,res){ 
			degrees.updateAssignment(req.params.degreeTitle, req.params.moduleID, req.body.isOptional, function(err){
				if(err){
					if(err.message == 'NOT_FOUND') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
				}else res.sendStatus(204);
			});
	});

	/**
	 * @api {delete} /api/degrees/:degreeTitle/modules/:moduleID Delete module-degree assignments.     
	 * @apiDescription Have to specify the degreeTitle and moduleID in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/Computer Science with Management/modules/5CCS2SEG
	 *
	 * @apiName DeleteModuleDegreeAssignments
	 * @apiGroup Degrees
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module code.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * @apiError NOT_FOUND The degree-module assignment does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.delete("/api/degrees/:degreeTitle/modules/:moduleID", authLevel(1), function(req,res){
		degrees.unassignFromDegree(req.params.degreeTitle, req.params.moduleID, function(err){
    	if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);   
				else {
					console.error(err);
					res.sendStatus(500);
				}
      }
			else res.sendStatus(204);
		});
	});
		
	// Degree dependencies 																								
	
	/**
	 * @api {get} /api/degrees/:degreeTitle/modules/dependencies Get a degree's dependencies .     
	 * @apiDescription Have to specify the degreeTitle in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/dependencies
	 *
	 * @apiName GetDegreeDependencies
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 */
	app.get("/api/degrees/:degreeTitle/modules/dependencies", function(req,res){
		degrees.getDependencies(req.params.degreeTitle, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});
	});		
	
	/**
	 * @api {post} /api/degrees/:degreeTitle/modules/dependencies Add a degree's dependencies.     
	 * @apiDescription Have to specify the degreeTitle in the parameters and the moduleID and dependentID in the body in json form.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/dependencies
	 * {moduleID : "6CCS1MAL", dependentID : "5CCS2SEG"}
	 *
	 * @apiName AddDegreeDependencies
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module code.
     * @apiParam {string} dependentID The moduleID of the module dependent on the module above.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 * @apiError ER_NO_REFERENCED_ROW_2 The degreeTitle or moduleID does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.post("/api/degrees/:degreeTitle/modules/dependencies", bodyParser.json(), authLevel(1), validator(validationConf.ASSIGNMENT_OPTIONS), validateSchemas([validationConf.DEPENDENCY_SCHEMA]),
		function(req,res){
			degrees.addDependencies(req.params.degreeTitle, req.body.moduleID, [req.body.dependentID], function(err){
				if(err){
					if(err.code == 'ER_NO_REFERENCED_ROW_2') res.sendStatus(404);
					else{
						res.sendStatus(500);
						console.error(err);
					}
				}else res.sendStatus(201);
			});
	});
	
	/**
	 * @api {post} /api/degrees/modules/dependencies Add degree dependencies in bulk.     
	 * @apiDescription Upload degree dependencies in bulk from a csv file. If process environment variable infile is set to true data insertion will attempt 
	 * to use the load data infile local command over inserts. 
	 * Will fail if disabled on mysql server. Have to add a mutlipart form data containing file field named batch.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/modules/dependencies
	 *
	 * @apiName AddDegreeDependenciesBulk
	 * @apiGroup Degrees
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 */
	app.post("/api/degrees/modules/dependencies", authLevel(1), upload.single('batch'), function(req,res){
		if(!req.file) res.status(400).send('File not transfered');
		else{ 
			var addDependenciesBulk = (process.env.LOAD_LOCAL_INFILE==='true')?degrees.addDependenciesBulkInfile:degrees.addDependenciesBulkInsert;
			addDependenciesBulk(req.file.path, function(err){		
				if(err){
					res.sendStatus(500);
					console.log(err);
				} else res.sendStatus(201);
				deleteTempFile(req.file.path);
			});
		}
	});
	
	/**
	 * @api {put} /api/degrees/:degreeTitle/modules/dependencies Update a degree's dependencies.     
	 * @apiDescription Have to specify the degreeTitle and the moduleID in the parameters and dependentIDArray in the body in json form. Can specify one or more dependencies.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/dependencies
	 * {moduleID : "6CCS1MAL", dependentIDArray : ["5CCS2SEG", "4CCS1IAI"]}
	 *
	 * @apiName UpdateDegreeDependencies
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module code.
     * @apiParam {string} dependentIDArray The modulesIDs of the modules dependent on the module above.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 */
	app.put("/api/degrees/:degreeTitle/modules/:moduleID/dependencies", bodyParser.json(), authLevel(1), validator(validationConf.ASSIGNMENT_OPTIONS),
		validateSchemas([validationConf.DEPENDECY_UPDATE_SCHEMA]), function(req,res){
			degrees.updateDependencies(req.params.degreeTitle, req.params.moduleID, req.body.dependentIDArray, function(err){
				if(err){
					console.error(err);
					res.sendStatus(500);
				} else res.sendStatus(204);
			});
	});
	
	// Degree Recommended
	
	/**
	 * @api {get} /api/degrees/:degreeTitle/modules/recommendations Get degree recommendations.     
	 * @apiDescription Have to specify the degreeTitle in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/recommendations
	 *
	 * @apiName GetDegreeRecommendations
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 */
	app.get("/api/degrees/:degreeTitle/modules/recommendations", authLevel(2), function(req,res){
		degrees.getRecommended(req.params.degreeTitle, function(err, data){
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.send(data);
		});
	});		
	
	/**
	 * @api {post} /api/degrees/:degreeTitle/modules/recommendations Add degree recommendations.     
	 * @apiDescription Have to specify the degreeTitle in the parameters and the moduleID and recommendedID in the body in json form.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/BSc Computer Science/modules/recommendations
	 * {moduleID : "4CCS1MAL", recommendedID :"5CCS2SEG"}
	 *
	 * @apiName AddDegreeRecommendations
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module code.
     * @apiParam {string} recommendedID The moduleID of the modules recommended based on the module above.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 * @apiError ER_NO_REFERENCED_ROW_2 The degreeTitle or moduleID does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.post("/api/degrees/:degreeTitle/modules/recommendations", bodyParser.json(), authLevel(1), validator(validationConf.ASSIGNMENT_OPTIONS), 
		validateSchemas([validationConf.RECOMMENDED_SCHEMA]), function(req,res){
			degrees.addRecommended(req.params.degreeTitle, req.body.moduleID, [req.body.recommendedID], function(err){
				if(err){
					if(err.code == 'ER_NO_REFERENCED_ROW_2') res.sendStatus(404);
					else{
						res.sendStatus(500);
						console.error(err);
					}
				}else res.sendStatus(201);
			});
	});
	
	/**
	 * @api {post} /api/degrees/modules/recommendations Update a degree's dependencies in bulk.     
	 * @apiDescription Route to upload degree dependencies in bulk from a csv file.If process environment variable infile is set to true
	 * data insertion will attempt to use the load data infile local command over inserts. Will fail if disabled on mysql server. 
	 * Have to add a mutlipart form data containing file field named batch.
	 * @apiExample Example usage : 
	 * /api/degrees/modules/recommendations
	 *
	 * @apiName UpdateDegreeDependenciesBulk
	 * @apiGroup Degrees
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 
	 */
	app.post("/api/degrees/modules/recommendations", authLevel(1), upload.single('batch'), function(req,res){
		if(!req.file) res.status(400).send('File not transfered');
		else{
			var addRecommendationsBulk = (process.env.LOAD_LOCAL_INFILE==='true')?degrees.addRecommendationsBulkInfile:degrees.addRecommendationsBulkInsert;
			addRecommendationsBulk(req.file.path, function(err){		
				if(err){
					res.sendStatus(500);
					console.log(err);
				} else res.sendStatus(201);
				deleteTempFile(req.file.path);
			});
		}
	});
	
	/**
	 * @api {put} /api/degrees/:degreeTitle/modules/:moduleID/recommendations Update a degree's recommendations.     
	 * @apiDescription Have to specify the degreeTitle and the moduleID in the parameters and recommendedIDArray in the body in json form. Can specify one or more recommendations.
	 *
	 * @apiExample Example usage : 
	 * /api/degrees/:degreeTitle/modules/:moduleID/recommendations
	 * { recommendedIDArray : ["5CCS2SEG", "4CCS1IAI"]}
	 *
	 * @apiName UpdateDegreeDependencies
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} moduleID The module code.
     * @apiParam {string} recommendedIDArray The modulesIDs of the modules recommended based on the module above.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 */
	app.put("/api/degrees/:degreeTitle/modules/:moduleID/recommendations", bodyParser.json(), authLevel(1), validator(validationConf.ASSIGNMENT_OPTIONS),
		validateSchemas([validationConf.RECOMMENDED_UPDATE_SCHEMA]), function(req,res){
			degrees.updateRecommended(req.params.degreeTitle, req.params.moduleID, req.body.recommendedIDArray, function(err){
				if(err){
					console.error(err);
					res.sendStatus(500);
				} else res.sendStatus(204);
			});
	});
	
	
	// Degree Building
	
	/**
	 * @api {post} /api/users/builds/ Create a degree build.     
	 * @apiDescription Have to specify the degreeTitle and the moduleID in the parameters and recommendedIDArray in the body in json form. Can specify one or more recommendations.
	 *
	 * @apiExample Example usage : 
	 * /api/users/builds/
	 * { degreeTitle : 'BSc Computer Science',  userID : "studentemail@kcl.ac.uk"}
	 *
	 * @apiName  CreateDegreeBuild
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} degreeTitle The name of the degree.
	 * @apiParam {string} userID The user's email.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 201 Created
	 */
	app.post("/api/users/builds/", bodyParser.json(),  authLevel(2), validator(validationConf.STRING_OPTIONS), requestFor('USER', 'BODY'), validateSchemas([validationConf.BUILD_SCHEMA]),
		function(req,res){
			degrees.createDegreeBuild(req.body.degreeTitle, req.body.userID,  function(err, buildID){
				if(err){
					console.error(err);
					res.sendStatus(500);
				} else{
					res.setHeader('Location', '/api/users/builds/'+ buildID);
					res.sendStatus(201);
				}	
			});
	});
	
	/**
	 * @api {get} /api/users/:userID/builds/ Retrieve degree buildsbased on userID and/or template degree.     
	 * @apiDescription Have to specify the userID in the parameters and template in the query. Can specify one or more degree templates.
	 *
	 * @apiExample Example usage : 
	 * /api/users/studentemail@kcl.ac.uk/builds?template=BSc Computer Science
	 *
	 * @apiName GetDegreeBuilds
	 * @apiGroup Degrees
	 *
	 * @apiParam {string} template The degree template.
	 * @apiParam {string} userID The user's email.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 */
	app.get("/api/users/:userID/builds/",  validator(validationConf.STRING_OPTIONS), validateSchemas([validationConf.TEMPLATE_SCHEMA]), function(req,res){
		degrees.retrieveBuilds(req.params.userID, req.query.template,  function(err, data){
			if(err){ 
				console.error(err);
				res.sendStatus(500);
			}else res.send(data);
		});
	});
	
	/**
	 * @api {get} /api/users/builds/:buildID Retrieve a degree build.     
	 * @apiDescription Have to specify the buildID in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/users/builds/1
	 *
	 * @apiName GetDegreeBuild
	 * @apiGroup Degrees
	 *
	 * @apiParam {int} buildID The ID of the degree build.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 * @apiError NOT_FOUND The build does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.get("/api/users/builds/:buildID", function(req,res){
		degrees.retrieveBuild(req.params.buildID,  function(err, data){
      if(err){
				if(err.message == 'BUILD_DOESN\'T_EXIST') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.send(data);	
		});
	});
	
	/**
	 * @api {put} /api/users/builds/:buildID/modules Update a degree build.     
	 * @apiDescription Have to specify the degreeTitle and the moduleID in the parameters and recommendedIDArray in the body in json form. Can specify one or more recommendations.
	 *
	 * @apiExample Example usage : 
	 * /api/users/builds/1/modules
	 * { moduleID : "5CCS2SEG"}
	 *
	 * @apiName UpdateDegreeBuild
	 * @apiGroup Degrees
	 *
	 * @apiParam {int} buildID The ID of the degree build.
	 * @apiParam {string} moduleID The module code.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * @apiError ENOT_FOUND The buildID or moduleID doesn't exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.put("/api/users/builds/:buildID/modules", bodyParser.json(),  authLevel(2), validator(validationConf.STRING_OPTIONS), validateSchemas([validationConf.MODULEID_SCHEMA]),
		requestFor('BUILDOWNER'), function(req,res){
			degrees.addToBuild(req.params.buildID, req.body.moduleID,  function(err){
				if(err){
					if(err.message == 'NOT_FOUND') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
				} else res.sendStatus(201);
			});
	});

	/**
	 * @api {delete} /api/users/builds/:buildID/modules/:moduleID Remove a module from a degree build.     
	 * @apiDescription Have to specify the buildID and the moduleID in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/users/builds/2/modules/5CCS2SEG
	 *
	 * @apiName RemoveModuleDegreeBuild
	 * @apiGroup Degrees
	 *
	 * @apiParam {int} buildID The ID of the degree build.
	 * @apiParam {string} moduleID The module code.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 * @apiError NOT_FOUND The build assignment does not exist.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 */
	app.delete("/api/users/builds/:buildID/modules/:moduleID",  authLevel(2), requestFor('BUILDOWNER'), function(req,res){
		degrees.removeFromBuild(req.params.buildID, req.params.moduleID, function(err){
			if(err){
				if(err.message == 'NOT_FOUND') res.sendStatus(404);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(204);
		});
	});
	
	/**
	 * @api {delete} /api/users/builds/:buildID Delete a degree build.     
	 * @apiDescription Have to specify the buildID in the parameters.
	 *
	 * @apiExample Example usage : 
	 * /api/users/builds/1
	 *
	 * @apiName DeleteDegreeBuild
	 * @apiGroup Degrees
	 *
	 * @apiParam {int} buildID The ID of the degree build.
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 */
	app.delete("/api/users/builds/:buildID",  authLevel(2), requestFor('BUILDOWNER'), function(req,res){
		degrees.removeBuild(req.params.buildID, function(err){
			if(err){
				console.error(err);
				res.sendStatus(500);

			} else res.sendStatus(204);
		});
	});
	

	
	// Authentication routes  //// ***********************************************************************************************************************************************
	
	/**
	 * @api {get} /logged_in Retrieve the currently logged in user's details if any.											
	 * @apiDescription If no user is logged in returns null.
	 * 
	 * @apiExample Example usage : 
	 *	/logged_in
	 *
	 * @apiName SignUp
	 * @apiGroup Authentication
	 *	 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  {UserID : "studentemail@kcl.ac.uk", FName : "Student", Lname : "Name", AccessGroup: 2}
	 *
	 */	
	app.get("/logged_in",function(req,res){ 
		
		res.cookie('selector_user', req.user, {maxAge: req.session.cookie.maxAge, expires: req.session.cookie.expires, httpOnly: false});
		res.send(req.user);
	});

	/**
	 * @api {get} /has_permissions/:accessGroup Check a user's permissions.                                
	 * @apiDescription Need to specify the access group as a parameter. Returns null if the user is not authenticated.
	 * 
	 * @apiExample Example usage : 
	 *	/has_permissions/1
	 *
	 * @apiName SignUp
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} accessGroup The user's access group. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  {UserID : "studentemail@kcl.ac.uk", AccessGroup : 2}
	 *
	 */	
	app.get("/has_permissions/:accessGroup", validator(),validateSchemas([validationConf.PARAMS_GROUP_SCHEMA]),function(req,res){ 
		if(req.user.AccessGroup <= req.params.accessGroup) res.send(req.user); 
		else res.send('null');
	});

	/**
	 * @api {post} /login Log in a user.                                                 
	 * @apiDescription Need to specify the userID and password of the user in the body in json form. Makes a cookie for the user to keep information accross pages.
	 * 
	 * @apiExample Example usage : 
	 *	/login
	 * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
	 *
	 * @apiName LogIn
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} userID The email of the user. 
	 * @apiParam {string} password The user's password. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */	
	app.post('/login', bodyParser.json(), validator(), function(req,res,next){
		req.query.userID = req.body.userID;
     	req.query.password = req.body.password;
     next();
	}, passport.authenticate('local-login'),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
            } else {
              req.session.cookie.expires = false;
            }
				res.cookie(
						'connect.sid', 
						req.cookies["connect.sid"], 
						{
								maxAge: req.session.cookie.maxAge,
								expires: req.session.cookie.expires,
								path: '/', 
								httpOnly: true
						}
				);
				res.cookie('selector_user', req.user, {maxAge: req.session.cookie.maxAge, expires: req.session.cookie.expires, httpOnly: false});
        res.sendStatus(200);
    });


	/**
	 * @api {post} /signup Sign up a user.							
	 * @apiDescription Need to specify the userID, first name, last name, password of the user in the body in json form.
	 * 
	 * @apiExample Example usage : 
	 *	/signup
	 * { userID : "moderatoremail@kcl.ac.uk", fName : "Moderator", lName : "Bond" , password : "password"} in json form.
	 *
	 * @apiName SignUp
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} userID The email of the user. 
	 * @apiParam {string} password The user's password. 
	 * @apiParam {string} fName The user's first name. 
	 * @apiParam {string} lName The user's last name.
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */	
	app.post('/signup', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USER_SCHEMA]), function(req,res,next){
		 req.query.userID = req.body.userID;
    	 req.query.password = req.body.password;
     next();
	}, passport.authenticate('local-signup'), function(req, res) { 
			res.cookie('selector_user', req.user, {maxAge: req.session.cookie.maxAge, expires: req.session.cookie.expires, httpOnly: false});
			res.sendStatus(200);
	});


	/**
	 * @api {post} /reset_password Reset a user's password once the user has received his token by email.
	 * @apiDescription Need to specify the userID and password of the user in the body in json form.
	 * 
	 * @apiExample Example usage : 
	 *	/reset_password
	 * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
	 *
	 * @apiName ResetPassword
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} userID The email of the user. 
	 * @apiParam {string} password The user's password. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */	
	app.post('/reset_password', bodyParser.json(),  validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.PASSWORD_SCHEMA]), validateToken, function(req, res) {
		users.resetPassword(req.body.userID, req.body.password, function(err){ 
			if(err){
				console.error(err);
				res.sendStatus(500);
			} else res.sendStatus(200);
		});
	});

	/**
	 * @api {post} /change_password Change a user's password.
	 * @apiDescription Need to specify the userID and password of the user in the body in json form.
	 * 
	 * @apiExample Example usage : 
	 *	/change_password
	 * { userID : "moderatoremail@kcl.ac.uk", password : "password"} in json form.
	 *
	 * @apiName ChangePassword
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} userID The email of the user. 
	 * @apiParam {string} password The user's password. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 * @apiError USER_DOESNT_EXIST The userID is not correct.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 * 
	 */	
	app.post('/change_password', bodyParser.json(), authLevel(2), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.PASSWORD_SCHEMA, validationConf.USERID_SCHEMA]),
		requestFor('USER', 'BODY'), function(req, res) { 
			users.resetPassword(req.body.userID, req.body.password, function(err){
				if(err){
					console.error(err);
					res.sendStatus(500);
				} else res.sendStatus(200);
			});
	});


	/**
	 * @api {put} /reset_access_group Reset the access group of a user.
	 * @apiDescription Need to specify the host of the web application as a header and the userID in json form in the body.
	 * 
	 * @apiExample Example usage : 
	 *	/reset_access_group
	 * { userID : "moderatoremail@kcl.ac.uk", accessGroup : 1} in json form.
	 *
	 * @apiName ResetAccessGroup
	 * @apiGroup Authentication
	 *	
	 * @apiParam {string} userID The email of the user. 
	 * @apiParam {string} accessGroup The new access group of the user. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 204 
	 *
	 * @apiError USER_DOESNT_EXIST The userID is not correct.
	 * @apiErrorExample :
	 * HTTP/1.1 404 Not Found
	 * 
	 */	
	app.put('/reset_access_group', bodyParser.json(),authLevel(0), validator(validationConf.USER_OPTIONS), validateSchemas([ validationConf.ACCESS_RESET_SCHEMA]),
		function(req, res) {
			users.setAccessGroup(req.body.userID, req.body.accessGroup, function(err){ 
				if(err){
					if(err.message == 'USER_DOESN\'T_EXIST') res.sendStatus(404);
					else{
						console.error(err);
						res.sendStatus(500);
					}
				}else res.sendStatus(204);
			});
	});

 /**
	 * @api {post} /request_reset Request the reset of the password associated with userID.
	 * @apiDescription Need to specify the host of the web application as a header and the userID in json form in the body.
	 * 
	 * @apiExample Example usage : 
	 *	/request_reset
	 * { userID : "studentemail@kcl.ac.uk"} in json form.
	 *
	 * @apiName RequestReset
	 * @apiGroup Authentication
	 *
	 * @apiParam {string} host The host on which the web application is. 
	 * @apiParam {string} userID The email of the user. 
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 * @apiError Unauthorized The userID is not correct.
	 * @apiErrorExample :
	 * HTTP/1.1 401 Unauthorized
	 * 
	 */
	app.post('/request_reset', bodyParser.json(), validator(validationConf.USER_OPTIONS), validateSchemas([validationConf.USERID_EMAIL_SCHEMA]), function(req,res){
		users.requestReset(req.headers.host, req.body.userID, function(err){
			if(err){
				if(err.message == 'USER_DOESN\'T_EXIST') res.sendStatus(401);
				else{
					console.error(err);
					res.sendStatus(500);
				}
			} else res.sendStatus(200);
		});
	});

   /**
	 * @api {get} /logout Log out.
	 * @apiDescription Logs out user but adds a cookie to keep his information for a some amount of time.
	 * 
	 * @apiExample Example usage : 
	 *	/logout
	 * 
	 * @apiName Logout
	 * @apiGroup Authentication
	 *
	 * @apiSuccessExample Success-Response:
 	 *  HTTP/1.1 200 OK
	 *
	 */	
	app.get('/logout', function(req, res, next) {
		req.logout();
		req.session.cookie.maxAge = 1000 * 3600 * 24 * 7;
		res.cookie(
				'connect.sid', 
				req.cookies["connect.sid"], 
				{
						maxAge: req.session.cookie.maxAge,
						expires: req.session.cookie.expires,
						path: '/', 
						httpOnly: true
				}
				
		);
		next();
	}, guestAuth, function(req,res){
		res.cookie('selector_user', req.user, {maxAge: req.session.cookie.maxAge, expires: req.session.cookie.expires, httpOnly: false});
		res.sendStatus(200);
	});
}
