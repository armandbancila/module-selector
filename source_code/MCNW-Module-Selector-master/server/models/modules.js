var getConnection = require('../config/connect_db.js').getConnection;
var async = require('async');
var csvParser = require('csv-parse');
var fs = require('fs');
var async = require('async');

/**
 *@module Modules
 */


/**
 * Modules.js provides the functions that can be called for all modules.
 */

/**
 * Function that allows you to get the page offset for a given array that contains the number per page and the page number.
 * @param {array} pagination - Contains an array of the number per page and page number.
 * @return a new pagination array that returns the value of page number * number per page and the number per page.
 */
var getPageOffsets = function(pagination){
	var perPage = 40;
	var page=0;
	if(pagination.perPage){
		perPage = pagination.perPage;	
	}
	
	if(pagination.pageNum){
		page = pagination.pageNum;	
	}

	var lower = page*perPage;
	var upper = parseInt(perPage);
	return [lower,upper];
}

/**
 * Function that returns all the modules in the database
 * @param {array} pagination - Takes an array containing the page number and page offset. 
 * @param {function} callback - Function to return error or result.
 * 
 * 
 */
exports.selectAll = function(pagination, callback){
		var connectionHandle;
		async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM Module ORDER BY ModuleID LIMIT ?, ?',
										getPageOffsets(pagination), (err, rows)=>done(err, rows, connection)),
									 (rows, connection, done)=>connection.query('SELECT FOUND_ROWS() AS \'count\'',(err, results) => done(err,rows,results)),
									 (rows, results, done)=>{	
										  var data = {};
											data.data = rows;
											data.total = results[0].count;
											done(null, data);
									 }],
									(err, data)=>{if(connectionHandle) connectionHandle.release();
																callback(err, data);});	
};

/**
 * Function that allows you to filter the modules based on an object of filters that are attributes or foriegn keys to a module.
 * @param {array} pagination - Take an array of the page number and number per page.
 * @param {object} filters - An object containing filters such as an array of tags, year or credits that a user wants to refine modules by.
 * @param {function} callback - A function that returns an error or result of the function.
 * 
 */	
exports.selectFiltered = function(pagination, filters, callback){
		var connectionHandle;
		var tags = filters.tags;
		var tagCount = 0;
		if(tags){
			tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
			tagCount = tags.length;
		}
		var days = filters.lectureDays;
		if(days)  days = Array.isArray(filters.lectureDays) ? filters.lectureDays : [filters.lectureDays];
		var range = filters.range;			
			var faculty = filters.faculty;
		var credits = filters.credits;
		var name = filters.moduleName;
		if(name) name = '%'+ name + '%';
		var data =[];
		var year= filters.year;
		var courseworkPercentage = filters.courseworkPercentage;
		data.push(tags);
		data.push(tagCount);
		data.push(days);
		data.push(credits);
		data.push(name);
		data.push(year);
		data.push(faculty);
		data.push(courseworkPercentage);
		if(range){
			data.push(range.substring(0,6));
			data.push(range.substring(7,14));
		}else{
			data.push(0);
			data.push(1);
		}
		var offsets = getPageOffsets(pagination);
		data.push(offsets[0]);
		data.push(offsets[1]);
		async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err, connection);}),
					(connection, done)=>connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM Module WHERE (CASE WHEN '+ (tags ? 'TRUE' : 'FALSE') +' THEN ModuleID IN '+
																							 '(SELECT ModuleID FROM ModuleTag '+
																								 'WHERE TagName IN (SELECT TagName FROM Tag WHERE TagName IN (?)) '+
																								 'GROUP BY ModuleID HAVING COUNT(TagName) = (?))'+
																							 'ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (days ? 'true' : 'false') +' THEN LectureDay IN (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (credits ? 'true' : 'false') +' THEN Credits = (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (name ? 'true' : 'false') +' THEN Name LIKE (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (year ? 'true' : 'false') +' THEN Year = (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (faculty ? 'true' : 'false') +' THEN Faculty = (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (courseworkPercentage ? 'true' : 'false') +' THEN CourseworkPercentage = (?) ELSE 1=1 END)'+
																							 'AND (CASE WHEN '+ (range ? 'true' : 'false') +' THEN LectureTime BETWEEN (?) AND (?) ELSE 1=1 END)'+
																							 'ORDER BY ModuleID LIMIT ?,?', data, (err, rows)=>done(err, rows, connection)),
									 (rows, connection, done)=>connection.query('SELECT FOUND_ROWS() AS \'count\'',(err, results) => done(err,rows,results)),
									 (rows, results, done)=>{	
										  var data = {};
											data.data = rows;
											data.total = results[0].count;
											done(null, data);
									 }],
									(err, data)=>{if(connectionHandle) connectionHandle.release();
																callback(err, data);});	
};

/**
 * Function that allows you to get a specfic module.
 * @param {string} moduleID - Takes the given module to return if it exists.
 * @param {function} callback - A function that returns an error or result of the function.
 * 
 */
exports.getModule = function(moduleID, callback){
	var connectionHandle;	
	async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err,connection);}),
									(connection, done)=>connection.query('SELECT * FROM Module WHERE ModuleID = (?)', [moduleID],(err,rows)=> done(err,rows)),
									(rows, done)=>done((rows.length==0?new Error('NOT_FOUND'): null), rows)],
									(err, rows)=>{if(connectionHandle) connectionHandle.release();		
																callback(err, rows);
	});			
};

/**
 * Function that returns all the faculties currently associated with the modules in the database.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.getModulesByFaculty = function(callback){ 
	getConnection((err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('SELECT DISTINCT Faculty FROM Module ', function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
		});

};

/**
 * Function that returns all the modules as given in the parameter if they exist in the database.
 * @param {array} moduleID - Takes an array of modules to return.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.getModules = function(moduleIDs, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('SELECT * FROM Module WHERE ModuleID IN (?)', [moduleIDs], function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
		});

};

/**
 * Function that adds a module and its required attribues to the database.
 * @param {string} moduleID - The short code of the module e.g. 5CCS2SEG.
 * @param {string} name - The name of the module.
 * @param {string} description - A description of the module to be shown in the enlarged tile window.
 * @param {int} year - Year of study the module is taken.
 * @param {int} credits - The amount of credits the module is worth.
 * @param {string} lectureDay - The day of thr week the lecture is held for this module.
 * @param {string} lectureTime - The time the lecture is held in the form of an sql data type instance in a string e.g. '14:00:00' or '140000'.
 * @param {int} coursework - The percentage of coursework the module is comprised of.
 * @param {string} faculty - The faculty this module belongs to.
 * @param {function} callback - A function that returns an error or the result of the function.
 * 
 */				
exports.addModule = function(moduleID, name, description, year, credits, lectureDay, lectureTime, coursework, faculty, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('INSERT INTO Module(ModuleID, Name, Description, Year, Credits, LectureDay, LectureTime, CourseworkPercentage, Faculty) '+
								 'VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?))', 
								 [moduleID, name, description, year, credits, lectureDay, lectureTime, coursework, faculty], function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
		});
};

/**
 * Function that updates a module and its required attribues in the database.
 * @param {string} moduleID - The short code of the module e.g. 5CCS2SEG.
 * @param {string} newModuleID - Updates the current moduleID to this one.
 * @param {string} name - The name of the module.
 * @param {string} description - A description of the module to be shown in the enlarged tile window.
 * @param {int} year - Year of study the module is taken.
 * @param {int} credits - The amount of credits the module is worth.
 * @param {string} lectureDay - The day of thr week the lecture is held for this module.
 * @param {string} lectureTime - The time the lecture is held in the form of an sql data type instance in a string e.g. '14:00:00' or '140000'.
 * @param {int} coursework - The percentage of coursework the module is comprised of.
 * @param {string} faculty - The faculty this module belongs to.
 * @param {function} callback - A function that returns an error or the result of the function.
 * 
 */
exports.updateModule = function(moduleID, newModuleID, name, description, year, credits, lectureDay, lectureTime, coursework, faculty, callback){ 
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('UPDATE Module SET ModuleID = (?), Name = (?), Year = (?), Credits = (?), LectureDay = (?),'+
												 'LectureTime = (?), Description = (?), CourseworkPercentage = (?), Faculty = (?) WHERE ModuleID = (?)', [newModuleID, name, year, credits, lectureDay, lectureTime, description, coursework, faculty, moduleID], function(err, rows, fields) {
					var error = err; 
			 	  if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
					callback(error);
					connection.release();
				});
			}
					
		});
};

/**
 * Function that removes a module from the database. 
 * @param {string} moduleID - The moduleID to be deleted.
 * @param {function} callback - A function that returns an error or the result of the function.
 * 
 */
exports.removeModule = function(moduleID, callback){
		var connectionHandle;	
		async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err, connection)}),				
				(connection, done)=>connection.query('DELETE FROM Module WHERE ModuleID = (?)', [moduleID], (err, rows)=>done(err, rows, connection)),
				(rows, connection, done)=>done((rows.affectedRows === 0 ? new Error('NOT_FOUND') : null))],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});		
};

/**
 * Function that allows the user to track modules, by adding the userID and moduleID in the UserTracking entity.
 * @param {string} moduleID - The module to track.
 * @param {string} userID - The userID of the user who wants to track the module.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.addTrackedModules = function(moduleID, userID, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{		
				connection.query('INSERT INTO UserTracking (UserID, ModuleID) VALUES (?, ?)', [userID, moduleID], function(err, rows, fields) {
					callback(err, rows);
     				connection.release();
				});
			}
					
		});
};

/**
 * Funtion that returns all the information about the modules tracked by a specific user.
 * @param {string} userID - Used to find the modules they track.
 * @param {array} pagination - Takes the page number and number per page.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.returnTrackedModules = function(userID, pagination, callback){
		var connectionHandle;	
		async.waterfall([(done)=>getConnection( (err, connection) =>{ connectionHandle = connection;var data = getPageOffsets(pagination);
																																	data.unshift(userID); done(err, data, connection);}),				
				(data, connection, done)=>
				connection.query('SELECT * FROM Module WHERE ModuleID IN (SELECT ModuleID FROM UserTracking WHERE UserID = (?)) '+
												 'ORDER BY ModuleID LIMIT ?, ?', data, (err, rows)=>done(err, rows, connection)),
									 (rows, connection, done)=>connection.query('SELECT FOUND_ROWS() AS \'count\'',(err, results) => done(err,rows,results)),
									 (rows, results, done)=>{	
										 	var data = {};
											data.data = rows;
											data.total = results[0].count;
											done(null, data);
									 }],
									(err, data)=>{if(connectionHandle) connectionHandle.release();
																callback(err, data);});	
};

/**
 * Function that returns all the modules tracked by a user but refined through given filters.
 * @param {string} userID - Used to find the modules they track.
 * @param {array} pagination - An array of the page number and number per page.
 * @param {object} filters - An object containing filters that a module can be refined by, such as credits, coursework percentage ...
 * @param {function} callback - A function that returns an error or the result of the function.
 */

exports.returnFilteredTrackedModules = function(userID, pagination, filters, callback){
		var connectionHandle;
		var tags = filters.tags;
		var tagCount = 0;
		if(tags){
			tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
			tagCount = tags.length;
		}
		var days = filters.lectureDays;
		if(days)  days = Array.isArray(filters.lectureDays) ? filters.lectureDays : [filters.lectureDays];
		var range = filters.range;			
			var faculty = filters.faculty;
		var credits = filters.credits;
		var courseworkPercentage = filters.courseworkPercentage;
		var name = filters.moduleName;
		if(name) name = '%'+ name + '%';
		var data =[];
		var year= filters.year;
		data.push(tags);
		data.push(tagCount);
		data.push(days);
		data.push(credits);
		data.push(name);
		data.push(year);
		data.push(courseworkPercentage);
		data.push(faculty);
		if(range){
			data.push(range.substring(0,6));
			data.push(range.substring(7,14));
		}else{
			data.push(0);
			data.push(1);
		}
		data.push(userID);
		var offsets = getPageOffsets(pagination);
		data.push(offsets[0]);
		data.push(offsets[1]);

		async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err, connection);}),
					(connection, done)=>connection.query('SELECT SQL_CALC_FOUND_ROWS * FROM Module WHERE (CASE WHEN '+ (tags ? 'TRUE' : 'FALSE') +' THEN ModuleID IN '+
										'(SELECT ModuleID FROM ModuleTag '+
								 		  'WHERE TagName IN (SELECT TagName FROM Tag WHERE TagName IN (?)) '+
								 		  'GROUP BY ModuleID HAVING COUNT(TagName) = (?))'+
										'ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (days ? 'true' : 'false') +' THEN LectureDay IN (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (credits ? 'true' : 'false') +' THEN Credits = (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (name ? 'true' : 'false') +' THEN Name LIKE (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (year ? 'true' : 'false') +' THEN Year = (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (courseworkPercentage ? 'true' : 'false') +' THEN CourseworkPercentage = (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (faculty ? 'true' : 'false') +' THEN Faculty = (?) ELSE 1=1 END)'+
								 'AND (CASE WHEN '+ (range ? 'true' : 'false') +' THEN LectureTime BETWEEN (?) AND (?) ELSE 1=1 END) '+
								 'AND ModuleID IN (SELECT ModuleID FROM UserTracking WHERE UserID = (?)) '+
								 'ORDER BY ModuleID LIMIT ?,?', data, (err, rows)=>done(err, rows, connection)),
									 (rows, connection, done)=>connection.query('SELECT FOUND_ROWS() AS \'count\'',(err, results) => done(err,rows,results)),
									 (rows, results, done)=>{	
										  var data = {};
											data.data = rows;
											data.total = results[0].count;
											done(null, data);
									 }],
									(err, data)=>{if(connectionHandle) connectionHandle.release();
																callback(err, data);});	
};

/**
 * Function that can remove a module a user currently tracks.
 * @param {string} moduleID - The moduleID to be removed from UserTracking.
 * @param {string} userID - The userID of the user who wants to remove a tracked module.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.removeTrackedModules = function(moduleID, userID, callback){
	var connectioHandle;	
	async.waterfall([(done)=>getConnection( (err, connection) =>{connectionHandle = connection; done(err, connection);}),
									 (connection, done)=>connection.query('DELETE FROM UserTracking WHERE UserID = (?) AND ModuleID = (?) ',
																												[userID,moduleID] , (err, rows)=>done(err,rows)),
									 (rows, done)=> done((rows.affectedRows==0?new Error('NOT_FOUND'):null))],
									(err)=>{if(connectionHandle) connectionHandle.release();
																callback(err);});	
};

/**
 * Function that counts the number of users who track a module with a given tagName.
 * @param {array} tagNames - The tagNames that need to be counted as tracked that are associated with a module.
 * @param {string} moduleID - The moduleID associated with a tag.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.countTracking = function(tagNames, moduleID, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				var data = [];
				for(var i = 0; i < tagNames.length; ++i){
					data.push([tagNames[i], moduleID, 1]);		
				}
				connection.query('INSERT INTO Tracked(TagName, ModuleID, Count) VALUES ? ON DUPLICATE KEY UPDATE Count = Count+1', [data] , function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
					
		});
};

/**
 * Function that gets recommended modules for a user given the tag names they are interested in.
 * @param {array} tagNames - An array of tagNames to be used to recommend a module.
 * @param {string} userID - The userID of the user to be recommended modules. Also needed to not recommend modules they already track.
 * @param {int} wanted - Limits the amount of modules returned by the function.
 * @param {function} callback - A function that returns an error or the result of the function.
 */

exports.getRecommended = function(tagNames, userID, wanted, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
			var tagCount = 1;			
			var limit = 4;
			
			if(wanted) limit = parseInt(wanted);
			if(isNaN(limit)) limit = 4;
			
			if(tagNames){
				tagNames = Array.isArray(tagNames) ? tagNames : [tagNames];
				tagCount = tagNames.length;
			}
			
				connection.query('SELECT * FROM Module NATURAL JOIN (SELECT ModuleID, (AVG(Count)*COUNT(ModuleID)/?) as Rank '+
												 'FROM Tracked WHERE (CASE WHEN '+ (tagNames ? 'true' : 'false') +' THEN TagName IN (?) ELSE 1=1 END) '+
												 'AND ModuleID NOT IN (SELECT ModuleID FROM UserTracking WHERE UserID = ? ) '+	
												 'GROUP BY ModuleID ORDER BY Rank DESC LIMIT ?) subResult', [tagCount, tagNames, userID, limit], function(err, rows, fields) {
					connection.release();																							
					callback(err, rows);
																												
				});
			}
					
		});
};

/**
 * Function that adds module data in a .csv file in bulk. 
 * @param {string} fileAddress - The file path of the file containing the module data to be uploaded.
 * @param {function} callback - A function that returns an error or the result of the function.
 */

exports.addBulkModuleDataInfile = function(fileAddress, callback){ 
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err,connection)=>{connectionHandle = connection; done(err,connection);}),
									 (connection, done)=>connection.query("LOAD DATA LOCAL INFILE ?  REPLACE INTO TABLE Module FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ",
										[fileAddress], done)],
									(err)=>{if(connectionHandle) connectionHandle.release();
													callback(err);});
};

/**
 * Function that adds module data in bulk insertions.
 * @param {string} fileAddress - The file path of the file containing the module data to be uploaded.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.addBulkModuleDataInsert = function(fileAddress, callback){
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{
									 	connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT INTO Module(ModuleID, Name, Description, Year, Credits, LectureDay, LectureTime, CourseworkPercentage, Faculty) '+
																															'VALUES ? ON DUPLICATE KEY UPDATE Name = VALUES(Name), Description = VALUES(Description), Year = VALUES(Year), '+
																															'Credits = VALUES(Credits), LectureDay = VALUES(LectureDay), LectureTime = VALUES(LectureTime), '+
																															'CourseworkPercentage = VALUES(CourseworkPercentage), Faculty = VALUES(Faculty)', [data], done)],
									(err)=>{if(connectionHandle)	connectionHandle.release();
													callback(err);});
};


