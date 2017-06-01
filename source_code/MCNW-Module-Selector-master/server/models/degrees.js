var getConnection = require('../config/connect_db.js').getConnection;
var async = require('async');
var csvParser = require('csv-parse');
var fs = require('fs');

/**
	* @module Degrees
	*/

/**
 * Class representing what can be done with a Degree.
 * 
 */


/**
 * Function for matching user's tracked modules to all the degrees to find most relevant. 
 * @param {string} userID - The user's email.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.matchDegrees = function(userID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT D.DegreeTitle FROM Degree AS D ORDER BY '+
																											 '(SELECT COUNT(ModuleID) FROM DegreeModule WHERE DegreeID = D.DegreeTitle '+
																											 'AND ModuleID IN '+
																											 '(SELECT ModuleID FROM UserTracking WHERE UserID = ?)) DESC', [userID] , done)],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();
														callback(err, rows);});
};

// DEGREE DEFINITION

/**
 * Function for creating a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeTitle - The title of the degree ex: BSc Computer Science.
 * @param {int} length - The length of the degree.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addDegree = function(degreeTitle, length, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('INSERT INTO Degree(DegreeTitle, LengthOfStudy) VALUES (?,?) ',
										[degreeTitle, length], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for creating degrees in bulk with a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the csv file to use for uploading the degree data.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addBulkDegreeDataInfile = function(fileAddress, callback){ 
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query("LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE Degree FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ",
										[fileAddress], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for creating degrees in bulk with a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the csv file to use for uploading the degree data.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addBulkDegreeDataInsert = function(fileAddress, callback){ 
	var connectionHandle;
	
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection;data.shift();done(err,connection, data);}), //TODO Split data under packet size
									 (connection, data, done)=>connection.query('INSERT INTO Degree(DegreeTitle, LengthOfStudy) VALUES ? '+
																															'ON DUPLICATE KEY UPDATE LengthOfStudy = VALUES(LengthOfStudy)',
										[data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for retrieving all degree information.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getDegrees = function(callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT * FROM Degree', done)],
									(err,rows)=>{if(connectionHandle) connectionHandle.release();
															 callback(err, rows);});
};

/**
 * Function for retrieving specific degree information.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getDegree = function(degreeID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT * FROM Degree WHERE DegreeTitle = ?',
										[degreeID], done)],
									(err,rows)=>{if(connectionHandle) connectionHandle.release();
															 callback(err, rows);});
};

/**
 * Function for updating degree information.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The old title of the degree ex : BSc Computer Science.
 * @param {string} newDegreeID - The new title of the degree ex : BSc Computer Science with Management.
 * @param {int} length - The new length of the degree.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.updateDegree = function(degreeID, newDegreeID, length, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('UPDATE Degree SET DegreeTitle = ?, LengthOfStudy = ? WHERE DegreeTitle = ?',
										[newDegreeID, length, degreeID], (err,rows)=>{var error = err; 
																																	if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
																																	done(error);})],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for deleting a degree.
 * Checks if the degree title exists and throws error NOT_FOUND if it doesn't. 
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree to delete ex : BSc Computer Science.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.deleteDegree = function(degreeID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM Degree WHERE DegreeTitle = ?',
										[degreeID], (err,rows)=>{var error = err; 
																						 if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
																						 done(error);})],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};


/**
 * Function for creating a degree-module assignment.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {boolean} isOptional - Whether the module is optional to take in the degree.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.assignToDegree = function(degreeID, moduleID, isOptional, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('INSERT INTO DegreeModule(DegreeID, ModuleID, IsOptional) VALUES (?,?,?) ',
										[degreeID, moduleID, isOptional], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};


/**
 * Function for creating degree-module assignments in bulk from a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The addresss of the file to use for uploading degree assignment data.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.assignToDegreeBulkInfile = function(fileAddress, callback){		
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query("LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE DegreeModule FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ", [fileAddress], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													 callback(err);});
};

/**
 * Function for creating degree-module assignments in bulk from a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The addresss of the file to use for uploading degree assignment data.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.assignToDegreeBulkInsert = function(fileAddress, callback){		
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT INTO DegreeModule(DegreeID, ModuleID, IsOptional) VALUES ? '+
																															'ON DUPLICATE KEY UPDATE IsOptional = VALUES(IsOptional)', [data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for retrieving degree-module assignments.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science. 
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getAssignments = function(degreeID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT * FROM (SELECT ModuleID, IsOptional FROM DegreeModule WHERE DegreeID = ?) sub1 '+ 
																												'NATURAL JOIN (SELECT * FROM Module) sub2',
										[degreeID], done)],
									(err,rows)=>{if(connectionHandle) connectionHandle.release();
															 callback(err, rows);});
};


/**
 * Function for updating degree-module assignments.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The new title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The new ID of the module ex : 5CCS2SEG.
 * @param {boolean} isOptional - The new value of whether the module is optional to take in the degree.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.updateAssignment = function(degreeID, moduleID, isOptional, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('UPDATE DegreeModule SET IsOptional = ? WHERE DegreeID = ? AND ModuleID = ?',
										[isOptional, degreeID, moduleID], (err,rows)=>{var error = err; 
																																	 if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
																																	 done(error);})],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};


/**
 * Function for deleting degree-module assignments.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree to be deleted ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module to be deleted ex : 5CCS2SEG.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.unassignFromDegree = function(degreeID, moduleID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM DegreeModule WHERE DegreeID = ? AND ModuleID = ?',
										[degreeID, moduleID],(err,rows)=>{var error = err; 
																						 if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
																						 done(error);})],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};
  

/**
 * Function for creating module dependencies in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} dependentIDs - The ID(s) of the module dependent on the module above ex : 5CCS2FC2 is dependent on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addDependencies = function(degreeID, moduleID, dependentIDs, callback){
	if(dependentIDs == null || dependentIDs.length == 0) return callback(null);
	var data = [];
	for(var i = 0; i < dependentIDs.length; ++i) data.push([degreeID, moduleID, dependentIDs[i]]);		
	
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('INSERT INTO ModuleDependency(DegreeID, Dependency, Parent) VALUES ?',
										[data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};

/**
 * Function for creating module dependencies in a degree in bulk.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the file in which the data for module dependencies is.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addDependenciesBulkInfile = function(fileAddress, callback){ 		
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query("LOAD DATA LOCAL INFILE ?  REPLACE INTO TABLE ModuleDependency FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ", [fileAddress], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for creating module dependencies in a degree in bulk.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the file in which the data for module dependencies is.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addDependenciesBulkInsert = function(fileAddress, callback){ 	
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT INTO ModuleDependency(DegreeID, Dependency, Parent) VALUES ? '+
																															'ON DUPLICATE KEY UPDATE DegreeID = DegreeID', [data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for retrieving degree module dependencies.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getDependencies = function(degreeID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT * FROM ModuleDependency WHERE DegreeID = ?',
										[degreeID], done)],
									(err,rows)=>{if(connectionHandle) connectionHandle.release();
															 callback(err, rows);});
};
 
/**
 * Function for updating module dependencies in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} dependentIDs - The ID(s) of the module dependent on the module above ex : 5CCS2FC2 is dependent on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.updateDependencies = function(degreeID, moduleID, dependentIDs, callback){
	var data = [];
	var IDs = [];
	if(dependentIDs) IDs = dependentIDs;
	for(var i = 0; i < IDs.length; ++i) data.push([degreeID, moduleID, IDs[i]]);		
	
	var connectionHandle;
	
	if(IDs.length===0)
		async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM ModuleDependency WHERE DegreeID = ? AND Dependency = ?',
										[degreeID, moduleID], (err)=>done(err, connection))],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
	
	else async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM ModuleDependency WHERE DegreeID = ? AND Dependency = ? AND Parent NOT IN (?)',
										[degreeID, moduleID, IDs], (err)=>done(err, connection)),
									 (connection, done)=>connection.query('INSERT INTO ModuleDependency(DegreeID, Dependency, Parent) VALUES ? '+
																												'ON DUPLICATE KEY UPDATE DegreeID = DegreeID', [data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};

/**
 * Function for deleting module dependencies in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} dependentIDs - The ID(s) of the module dependent on the module above ex : 5CCS2FC2 is dependent on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.removeDependencies = function(degreeID, moduleID, dependentIDs, callback){
	if(dependentIDs == null || dependentIDs.length == 0) return callback(null);
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM ModuleDependency WHERE DegreeID = ? AND Dependency = ? AND Parent IN (?)',
									[degreeID, moduleID, dependentIDs], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};

/**
 * Function for creating module recommendations in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} recommendedIDs - The ID(s) of the recommended modules based on the module above ex : 5CCS2FC2 is recommended based on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addRecommended = function(degreeID, moduleID, recommendedIDs, callback){
	if(recommendedIDs == null || recommendedIDs.length == 0) return callback(null);
	var data = [];
	for(var i = 0; i < recommendedIDs.length; ++i) data.push([degreeID, moduleID, recommendedIDs[i]]);		
	
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('INSERT INTO ModuleRecommendation(DegreeID, ModuleID, Recommendation) VALUES ?',
										[data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};


/**
 * Function for creating module recommendations in a degree in bulk from a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the file where the data for module recommendations is.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addRecommendationsBulkInfile = function(fileAddress, callback){ 		
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query("LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE ModuleRecommendation FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ", [fileAddress], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for creating module recommendations in a degree in bulk from a csv file.
 * Only available to the administrator and moderator.
 * @param {string} fileAddress - The address of the file where the data for module recommendations is.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addRecommendationsBulkInsert = function(fileAddress, callback){ 	
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT INTO ModuleRecommendation(DegreeID, ModuleID, Recommendation) VALUES ? '+
																												'ON DUPLICATE KEY UPDATE DegreeID = DegreeID', [data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};


 
/**
 * Function for retrieving module recommendations in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getRecommended = function(degreeID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT * FROM ModuleRecommendation WHERE DegreeID = ?',
										[degreeID], done)],
									(err,rows)=>{if(connectionHandle) connectionHandle.release();
													callback(err,rows)});
};

 
/**
 * Function for updating module recommendations in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} recommendedIDs - The ID(s) of the recommended modules based on the module above ex : 5CCS2FC2 is recommended based on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.updateRecommended = function(degreeID, moduleID, recommendedIDs, callback){
	var data = [];
	var IDs = [];
	if(recommendedIDs) IDs = recommendedIDs;
	for(var i = 0; i < IDs.length; ++i) data.push([degreeID, moduleID, IDs[i]]);		
	
	var connectionHandle;
	if(IDs.length===0)
		async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM ModuleRecommendation WHERE DegreeID = ? AND ModuleID = ?',
										[degreeID, moduleID], (err)=>done(err, connection))],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
	else async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('DELETE FROM ModuleRecommendation WHERE DegreeID = ? AND ModuleID = ? AND Recommendation NOT IN (?)',
										[degreeID, moduleID, IDs], (err)=>done(err, connection)),
									 (connection, done)=>connection.query('INSERT INTO ModuleRecommendation(DegreeID, ModuleID, Recommendation) VALUES ?'+
																												'ON DUPLICATE KEY UPDATE DegreeID = DegreeID', [data], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};


/**
 * Function for deleting module recommendations in a degree.
 * Only available to the administrator and moderator.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {string | String[]} recommendedIDs - The ID(s) of the recommended modules based on the module above ex : 5CCS2FC2 is recommended based on 4CCS1FC1.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.removeRecommended = function(degreeID, moduleID, recommendedIDs, callback){
	if(recommendedIDs == null || recommendedIDs.length == 0) return callback(null);
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM ModuleRecommendation WHERE DegreeID = ? AND ModuleID = ? AND Recommendation = ?',
									[degreeID, moduleID, recommendedIDs], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err)});
};


// DEGREE BUILDING

/**
 * Function for creating a degree build.
 * @param {string} degreeID - The title of the degree ex : BSc Computer Science.
 * @param {string} userID - The user's email.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.createDegreeBuild = function(degreeID, userID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('INSERT INTO DegreeBuild(DegreeTemplate, Owner) VALUES (?,?)',
									[degreeID, userID], (err)=>done(err,connection)),
									(connection, done)=>connection.query('SELECT LAST_INSERT_ID() AS BuildID', (err, rows)=>done(err,connection, rows[0].BuildID)),
									(connection, buildID, done)=>connection.query('INSERT INTO BuildComponent(BuildID, ModuleID, IsDependent)'+
																															  'SELECT ? AS BuildID, ModuleID, IsDependent FROM '+
																															  '(SELECT ModuleID, (CASE WHEN ModuleID IN (SELECT Dependency AS ModuleID '+ 																												 
																															  'FROM ModuleDependency WHERE DegreeID = ?) THEN true ELSE false END) AS IsDependent '+
																															  'FROM UserTracking WHERE UserID = ? AND ModuleID IN '+
																															  '(SELECT ModuleID FROM DegreeModule WHERE DegreeID = ? AND IsOptional = true) ' +
																															 	  'UNION ' +
																															  'SELECT Parent AS ModuleID, false as IsDependent '+
																															  'FROM ModuleDependency WHERE DegreeID = ? AND Dependency IN '+ 
																															  '(SELECT ModuleID AS Dependency FROM UserTracking '+
																															  'WHERE UserID = ? AND ModuleID IN '+
																															  '(SELECT ModuleID FROM DegreeModule '+
																															  'WHERE DegreeID = ? AND IsOptional = true))) Res',
									[buildID, degreeID, userID, degreeID, degreeID, userID, degreeID], (err, rows)=>done(err, buildID, rows, connection))],
									(err, buildID)=>{if(connectionHandle) connectionHandle.release();
																	 callback(err, buildID)});
};

	
/**
 * Function for retrieving a degree build.
 * @param {int} buildID - The ID of the build.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.retrieveBuild = function(buildID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT DegreeTemplate '+
																															'FROM DegreeBuild '+
																															'WHERE BuildID = ?',
									[buildID], (err, rows)=>done(err, rows, connection)),
									(rows, connection, done)=>{	if(rows.length == 0) return done(new Error('BUILD_DOESN\'T_EXIST'));
																							return done(null, rows[0].DegreeTemplate, connection);
																						},
									(degreeID, connection, done)=>connection.query('SELECT * FROM (SELECT ModuleID, (CASE WHEN IsDependent THEN "DEPENDENT" '+ 
																											 'WHEN ModuleID IN (SELECT Parent AS ModuleID FROM ModuleDependency ' +
																											 'WHERE DegreeID = ? '+
																											 'AND Dependency IN (SELECT ModuleID AS Dependency '+
																											 'FROM BuildComponent where BuildID = ? AND IsDependent = 1 )) '+
																											 'THEN "DEPENDENCY" ELSE "Normal" END) AS Evaluated '+
																											 'FROM BuildComponent WHERE BuildID = ? '+
																											 'UNION '+
																											 'SELECT ModuleID, "Compulsory" AS Evaluated '+
																											 'FROM (SELECT ModuleID FROM DegreeModule WHERE IsOptional = false AND '+
																											 'DegreeID = ?) QeuryResult) UnionResult '+
																											 'NATURAL JOIN Module',
									[degreeID, buildID, buildID, degreeID], (err, rows)=>done(err, rows, connection, degreeID)),
									(rows, connection, degreeID, done)=>{	var build = {};
																												build.components = rows;
																												build.buildID = buildID;
																												build.template = degreeID;
																												done(null, build, connection);},
									(build, connection, done)=>connection.query('SELECT Recommendation, ModuleID AS DueTo '+
																															'FROM ModuleRecommendation '+
																															'WHERE ModuleID IN '+
																															'(SELECT ModuleID FROM BuildComponent WHERE BuildID = ?)',
									[buildID], (err, rows)=>done(err, build, rows, connection)),
									(build, rows, connection, done)=>{	build.recommended = rows;
																								done(null, build, connection);}],
									(err, build)=>{if(connectionHandle) connectionHandle.release();
															   callback(err, build);});
};
var self = this;

/**
 * Function for retrieving all degree builds.
 * @param {string} userID - The user's email.
 * @param {string} template - The degree title ex: BSc Computer Science.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.retrieveBuilds = function(userID, template, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT BuildID FROM DegreeBuild WHERE Owner = ? AND '+
																											 '(CASE WHEN '+ (template ? 'true' : 'false') +' THEN DegreeTemplate = (?) ELSE 1=1 END)',
									[userID, template], (err, rows)=>done(err, rows, connection)),
									(rows, connection, done)=>async.mapSeries(rows,(build, cb)=> this.retrieveBuild(build.BuildID,
									(err, buildModules)=>cb(err, buildModules, connection)),
									(err, builds, connection)=>done(err, builds, connection))],
									(err, builds)=>{if(connectionHandle) connectionHandle.release();
															    callback(err, builds);});
};

/**
 * Function for adding to a degree build.
 * @param {string} buildID - The ID of the build.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.addToBuild = function(buildID, moduleID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT ModuleID FROM DegreeModule WHERE ModuleID = ? AND DegreeID = '+
																											 '(SELECT DegreeTemplate FROM DegreeBuild WHERE BuildID = ?)',[moduleID, buildID], (err, rows)=> done(err, rows, connection)),
									(rows, connection, done)=>{done((rows.length==0 ? new Error('NOT_FOUND'):null), connection);},
									(connection, done)=>connection.query('INSERT INTO BuildComponent(BuildID, ModuleID, IsDependent)'+
																											 'SELECT ? AS BuildID, ModuleID, IsDependent FROM '+
																											 '(SELECT ? AS ModuleID, (CASE WHEN ? IN (SELECT Dependency AS ModuleID '+
																											 'FROM ModuleDependency WHERE DegreeID = (SELECT DegreeTemplate FROM DegreeBuild WHERE BuildID = ?)) '+
																											 'THEN true ELSE false END) AS IsDependent '+
																												 'UNION ' +
																											 'SELECT Parent AS ModuleID, false as IsDependent '+
																											 'FROM ModuleDependency WHERE DegreeID = (SELECT DegreeTemplate FROM DegreeBuild WHERE BuildID = ?) '+
																											 'AND Dependency = ?) Res '+
																											 'ON DUPLICATE KEY UPDATE BuildID = BuildID',
									[buildID, moduleID, moduleID, buildID, buildID, moduleID], (err, rows)=>done(err, rows, connection))],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for removing a module from a degree build.
 * @param {string} buildID - The ID of the build.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.removeFromBuild = function(buildID, moduleID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM BuildComponent WHERE BuildID = ? AND ModuleID IN '+
																											 '(SELECT Dependency AS ModuleID FROM ModuleDependency '+
																											 'WHERE DegreeID = (SELECT DegreeTemplate FROM DegreeBuild WHERE BuildID = ?) AND Parent = ? '+
																											 'UNION '+
																											 'SELECT Parent AS ModuleID FROM ModuleDependency '+
																											 'WHERE DegreeID = (SELECT DegreeTemplate FROM DegreeBuild WHERE BuildID = ?) AND Dependency = ?) '+
																											 'OR ModuleID = ?',
									[buildID, buildID, moduleID, buildID, moduleID, moduleID], (err, rows)=>done(err, rows, connection)),
									(rows, connection, done)=>done(rows.affectedRows==0?new Error('NOT_FOUND'):null)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function for deleting a degree build.
 * @param {string} buildID - The ID of the build.
 * @param {string} moduleID - The ID of the module ex : 5CCS2SEG.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.removeBuild = function(buildID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('DELETE FROM DegreeBuild WHERE BuildID = ?',
									[buildID], (err,rows)=>done(err,rows))],
									(err)=>{if(connectionHandle) connectionHandle.release();
											    callback(err);});
};


/**
 * Function for retrieving the owner of a build.
 * @param {string} buildID - The ID of the build.
 * @param {function} callback - What to do with the result of the function.
 * 
 */
exports.getOwner = function(buildID, callback){
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT Owner FROM DegreeBuild WHERE BuildID = ?',
									[buildID], (err, rows)=>{
										if(rows.length == 0) done(new Error('BUILD_DOESN\'T_EXIST'));
										else done(null, rows[0].Owner);
									})],
									(err, ownerID)=>{if(connectionHandle) connectionHandle.release();
											    callback(err, ownerID);});
};
