var getConnection = require('../config/connect_db.js').getConnection;
var async = require('async');
var csvParser = require('csv-parse');
var fs = require('fs');

/**
 * @module Tags 
 */

/**
 * Function that returns all the different tag categories currently in the database.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.getCategories = function(callback){
	getConnection( (err, connection) =>{
			if(err) callback(err);
			else{					
				connection.query('SELECT DISTINCT Category FROM Tag WHERE Category IS NOT NULL', function(err, rows, fields) {
					callback(err, rows);
        	connection.release();
				});
			}
					
	});
};

/**
 * Function that returns all the tags currently in the database.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.getTags = function(callback){
	getConnection( (err, connection) =>{
			if(err) callback(err);
			else{					
				connection.query('SELECT * FROM Tag', function(err, rows, fields) {
					callback(err, rows);
        	connection.release();
				});
			}
					
	});
};

/**
 * Function that returns all the tags associated with a given module.
 * @param {string} moduleID - Return the tags associated with this module.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.selectTags = function(moduleID, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{		
				connection.query('SELECT * FROM Tag WHERE TagName IN (SELECT TagName FROM ModuleTag WHERE ModuleID = (?))', [moduleID], function(err, rows, fields) {
					callback(err, rows);
          connection.release();
				});
			}
					
		});
}; 

/**
 * Function that adds a new tag to the database with its required attributes.
 * @param {string} tagName - The name of the tag to be added.
 * @param {string} category - The category the tag belongs to, e.g. Careers or Skills.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.createTag = function(tagName, category, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('INSERT INTO Tag (TagName, Category) VALUES ((?), (?))', [tagName,category], function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
					
		});
}; 

/**
 * Function that updates the attributes of a given tag.
 * @param {string} tagName - The tag to be updated.
 * @param {string} newTagName - The new tag name the given tag is to be updated to.
 * @param {string} category - The new category.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.updateTag = function(tagName, newTagName, category, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('UPDATE Tag SET TagName = ?, Category = ? WHERE TagName = ?', [newTagName, category, tagName], function(err, rows) {
					var error = err; 
			 	  if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
					callback(error);
					connection.release();
				});
			}
					
		});
}; 

/**
 * Function to remove a tag from the database.
 * @param {string} tagName - The tag to be deleted.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.deleteTag = function(tagName, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query('DELETE FROM Tag WHERE TagName = (?)', [tagName], function(err, rows, fields) {
					var error = err; 
			 	  if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
					callback(error);
          connection.release();
				});
			}
					
		});
};

/**
 * Function that returns the tags associated with an array of given modules.
 * @param {array} moduleIDs - An array of moduleIDs to find the tags assigned to them.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.getAssigned = function(moduleIDs, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{	
				var modules;				
				if(moduleIDs && moduleIDs.length !=0){
					modules = Array.isArray(moduleIDs) ? moduleIDs : [moduleIDs];
				}
				connection.query('SELECT * FROM Tag WHERE TagName IN (SELECT TagName FROM ModuleTag WHERE '+
								'CASE WHEN '+ (modules ? 'TRUE' : 'FALSE') +' THEN ModuleID IN (?) ELSE 1=1 END)', [modules], function(err, rows, fields) {
					callback(err, rows);
					connection.release();
				});
			}
					
		});
}; 

/**
 * Function that assigns a tag to a module.
 * @param {string} tagName - The tag to be assigned.
 * @param {string} moduleID - The module to be assigned to the tagName.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.assignTag = function(tagName, moduleID, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{	
				connection.query('INSERT INTO ModuleTag VALUES ((?),(?))', [moduleID, tagName], function(err, rows, fields) {
					callback(err, rows);
          connection.release();
				});
			}
					
		});
};

/**
 * Function that assigns tags to modules in bulk. 
 * @param {string} fileAddress - The file path of the .csv file that contains the data to be assigned.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.addBulkAssignTagDataInfile = function(fileAddress, callback){ 
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
				connection.query("LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE ModuleTag FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ",[fileAddress] ,function(err, rows, fields) {
					callback(err, rows);
 			    connection.release();
				});
			}		
		});
}

/**
 * Function that assigns tags to modules in bulk insertions.
 * @param {string} fileAddress - The file path of the .csv file that contains the data to be assigned.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.addBulkAssignTagDataInsert = function(fileAddress, callback){ 
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT ModuleTag(ModuleID, TagName) VALUES ? '+
																															'ON DUPLICATE KEY UPDATE ModuleID = ModuleID', [data], done)],
									(err)=>{if(connectionHandle)connectionHandle.release();
													callback(err);});

}

/**
 * Function that unassigns a tag from a module.
 * @param {string} tagName - The tag to be unassigned.
 * @param {string} moduleID - The module to be unassigned.
 * @param {function} callback - A function that returns an error or the result of the function.
 * 
 */
exports.unassignTag = function(tagName, moduleID, callback){
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{	
				connection.query('DELETE FROM ModuleTag WHERE ModuleID = (?) AND TagName = (?)', [moduleID, tagName], function(err, rows, fields) {
					var error = err; 
			 	  if(!err && rows.affectedRows === 0) error=new Error('NOT_FOUND'); 
					callback(error);
          connection.release();
				});
			}
					
		});
};

/**
 * Function that adds tags to the database in bulk through a .csv file.
 * @param {string} fileAddress - The file path of the csv file containing the tag data to be added.
 * @param {function} callback - A function that returns an error or the result of the function.
 */
exports.addBulkTagDataInfile = function(fileAddress, callback){ 
		getConnection( (err, connection) =>{
			if(err) callback(err);
			else{			
			
				connection.query("LOAD DATA LOCAL INFILE ? REPLACE INTO TABLE Tag FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 ROWS ",[fileAddress] ,function(err, rows, fields) {
					callback(err, rows); 
 			    connection.release();
				});
			}
					
		});

};

/**
 * Function that adds tags to the database in bulk insertions.
 * @param {string} fileAddress - The file path of the csv file containing the tag data to be added.
 * @param {function} callback - A function that returns an error or the result of the function.
 */

exports.addBulkTagDataInsert = function(fileAddress, callback){ 
	var connectionHandle;
	async.waterfall([(done)=>fs.createReadStream(fileAddress).pipe(csvParser(done)),
									 (data, done)=>getConnection((err,connection)=>{connectionHandle = connection; data.shift();done(err,connection,data);}),
									 (connection, data, done)=>connection.query('INSERT INTO Tag(TagName, Category) VALUES ? '+
																															'ON DUPLICATE KEY UPDATE Category = VALUES(Category)', [data], done)],
									(err)=>{if(connectionHandle)connectionHandle.release();
													callback(err);});
};
