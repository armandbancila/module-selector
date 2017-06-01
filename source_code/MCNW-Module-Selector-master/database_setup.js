var async = require('async');
var bcrypt = require('bcrypt');
var db = require('./server/config/connect_db.js');

var createConnection = function(callback) {
			db.getConnection(function(err, connection){
				if(err) return callback(err);
				callback(null, connection);
			});
}

var createTables = function(connection, callback) {
	async.waterfall([(done)=>connection.query('CREATE TABLE IF NOT EXISTS Session ('+
																				 'SessionID VARCHAR(128) NOT NULL,'+
																				 'Expires int(11) unsigned NOT NULL,'+
																				 'Data text,'+
																				 'PRIMARY KEY(SessionID))', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS Degree('+
																				 'DegreeTitle VARCHAR(100),'+
																				 'LengthOfStudy INT,'+
																				 'PRIMARY KEY(DegreeTitle))', (err)=>done(err)),										
					 			(done)=>connection.query('CREATE TABLE IF NOT EXISTS Module('+
																				 'ModuleID VARCHAR(30) NOT NULL UNIQUE,'+
																				 'Name VARCHAR(100),'+
																				 'Description text,'+
																				 'Year int,'+
																				 'Credits int,'+
																				 'LectureDay VARCHAR(10),'+
																				 'LectureTime time,'+
																				 'CourseworkPercentage decimal(5,2),'+
																				 'Faculty VARCHAR(100),'+
																				 'PRIMARY KEY(ModuleID))', (err)=>done(err)),
					 			(done)=>connection.query('CREATE TABLE IF NOT EXISTS User ('+
																				 'UserID VARCHAR(100) NOT NULL UNIQUE,'+
																				 'FName VARCHAR(50),'+
																				 'LName VARCHAR(50),'+
																				 'Password CHAR(60) BINARY,'+
																				 'AccessGroup int,'+
																				 'SessionLink VARCHAR(128) UNIQUE,'+
																				 'PRIMARY KEY(UserID),'+
																				 'FOREIGN KEY(SessionLink) REFERENCES Session(SessionID)'+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS UserTracking ('+
																				 'UserID VARCHAR(100),'+
																				 'ModuleID VARCHAR(30),'+
																				 'PRIMARY KEY(UserID, ModuleID),'+
																				 'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE,'+
																				 'FOREIGN KEY(UserID) REFERENCES User(UserID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS Tag ('+
																				 'TagName VARCHAR(50) NOT NULL UNIQUE,'+
																				 'Category VARCHAR(50),'+
																				 'PRIMARY KEY(TagName))', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS ModuleTag ('+
																				 'ModuleID VARCHAR(30),'+
																				 'TagName VARCHAR(50),'+
																				 'PRIMARY KEY(ModuleID, TagName),'+
																				 'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE,'+
																				 'FOREIGN KEY(TagName) REFERENCES Tag(TagName) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS DegreeModule ('+
																				 'DegreeID VARCHAR(100),'+
																				 'ModuleID VARCHAR(30),'+
																				 'IsOptional boolean,'+
																				 'PRIMARY KEY(ModuleID, DegreeID),'+
																				 'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE,'+
													 							 'FOREIGN KEY(DegreeID) REFERENCES Degree(DegreeTitle) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS ModuleRecommendation ('+
																				 'DegreeID VARCHAR(100),'+
																				 'ModuleID VARCHAR(30),'+
																				 'Recommendation VARCHAR(30),'+
																				 'PRIMARY KEY(DegreeID, ModuleID, Recommendation),'+
																				 'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE,'+
									 											 'FOREIGN KEY(Recommendation) REFERENCES Module(ModuleID) '+
									 											 'ON DELETE CASCADE ON UPDATE CASCADE,'+
													 							 'FOREIGN KEY(DegreeID) REFERENCES Degree(DegreeTitle) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),									 
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS ModuleDependency('+
																					'DegreeID VARCHAR(100),'+
																					'Dependency VARCHAR(30),'+
																					'Parent VARCHAR(30),'+
																					'PRIMARY KEY(DegreeID, Parent, Dependency),'+
																					'FOREIGN KEY(Parent) REFERENCES Module(ModuleID)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE,'+
																					'FOREIGN KEY(Dependency) REFERENCES Module(ModuleID)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE,'+
																					'FOREIGN KEY(DegreeID) REFERENCES Degree(DegreeTitle)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS DegreeBuild('+
																					'BuildID INT NOT NULL AUTO_INCREMENT,'+
																					'DegreeTemplate VARCHAR(100) NOT NULL,'+
																					'Owner VARCHAR(100) NOT NULL,'+
																					'PRIMARY KEY(BuildID),'+
																					'FOREIGN KEY(DegreeTemplate) REFERENCES Degree(DegreeTitle)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE,'+
																					'FOREIGN KEY(Owner) REFERENCES User(UserID)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								 (done)=>connection.query('CREATE TABLE IF NOT EXISTS BuildComponent('+
																					'BuildID INT NOT NULL,'+
																					'ModuleID VARCHAR(30) NOT NULL,'+
																					'IsDependent boolean NOT NULL,'+
																					'PRIMARY KEY(BuildID, ModuleID),'+
																					'FOREIGN KEY(BuildID) REFERENCES DegreeBuild(BuildID)'+
																					'ON DELETE CASCADE ON UPDATE CASCADE,'+
																					'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID)'+
																					'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS Tracked('+
																					'TagName VARCHAR(50) NOT NULL,'+
																					'ModuleID VARCHAR(30) NOT NULL,'+
																					'Count INT UNSIGNED NOT NULL DEFAULT 1,'+
																					'PRIMARY KEY(TagName, ModuleID),'+
																					'FOREIGN KEY(TagName) REFERENCES Tag(TagName)'+
																					'ON DELETE CASCADE ON UPDATE CASCADE,'+
																					'FOREIGN KEY(ModuleID) REFERENCES Module(ModuleID)'+ 
																					'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS Feedback('+
																					'FeedbackID INT NOT NULL AUTO_INCREMENT,'+
																					'Day DATE,'+
																					'Ratings TEXT,'+
																					'Reasons TEXT,'+
																					'Comments TEXT,'+
																					'PRIMARY KEY(FeedbackID, Day))', (err)=>done(err)),
								(done)=>connection.query('CREATE TABLE IF NOT EXISTS ResetToken ('+
																				 'Token VARCHAR(50),'+
																				 'ExpiryDate int(11) unsigned,'+
																				 'UserID VARCHAR(100),'+
																				 'PRIMARY KEY(UserID),'+
																				 'FOREIGN KEY(UserID) REFERENCES User(UserID) '+
																				 'ON DELETE CASCADE ON UPDATE CASCADE)', (err)=>done(err))],
								(err)=>callback(err, connection)
	);
}


var setup = function(cb){
	async.waterfall([
		createConnection,
		createTables],
		(err, connection)=>{
			if(connection)connection.release();
			if(err) return cb(err);

			console.log('Database confirmed');
			cb();
		}
	);
}

exports.refresh = setup;

