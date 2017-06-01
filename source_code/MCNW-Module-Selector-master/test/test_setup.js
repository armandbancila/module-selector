var async = require('async');
var bcrypt = require('bcrypt');
var db = require('../server/config/connect_db.js');

var createConnection = function(callback) {
  	db.connect(db.TEST_MODE, function(){
			db.getConnection(function(err, connection){
				if(err) return callback(err);
				connection.beginTransaction(function(error){
					callback(error, connection);
				});
			});
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
																				 'Faculty VARCHAR(200),'+
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


var insertData = function(connection, callback) {
	var hash = bcrypt.hashSync('plaintextpassword', 10);
	var hash2 = bcrypt.hashSync('testpassword', 10);

	var exp1 = (Date.now() - 3500658)/1000;
	var exp2 = (Date.now() + 9999999)/1000;
	var exp3 = (Date.now() - 3500000)/1000;
	
		
	async.waterfall([(done)=>connection.query("INSERT INTO Module (ModuleID, Name, Description, Year, Credits, LectureDay, LectureTime, CourseworkPercentage, Faculty) VALUES"+
																				"('5CCS2OSC', 'Operating Systems and Concurrency', 'OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION', 2, 15, 'Wednesday', '10:00:00', 015.00, 'Informatics'),"+
																				"('4CCS1FC1', 'Foundations of Computing 1', 'FOUNDATIONS OF COMPUTING 1 DESCRIPTION', 1, 15, 'Monday', '14:00:00', 000.00 ,'Informatics'),"+
																				"('4CCS2DBS', 'Database Systems', 'DATABASE SYSTEMS DESCRIPTION', 1, 15, 'Friday', '11:00:00', 020.00, 'Informatics'),"+
																				"('5CCS2SEG', 'Software Engineering Group Project', 'SOFTWARE ENGINEERING DESCRIPTION', 2, 30, 'Monday', '12:00:00', 085.00, 'Informatics'),"+
																				"('5CCS1FC2', 'Foundations of Computing 2', 'FOUNDATIONS OF COMPUTING 1 DESCRIPTION', 1, 15, 'Wednesday', '14:00:00', 000.00 ,'Informatics'),"+
																				"('5CCS1INS', 'Internet Systems', 'INTERNET SYSTEMS DESCRIPTION', 2, 15, 'Thursday', '13:00:00', 020.00, 'Informatics'),"+
																				"('5SSMN210', 'Accounting', 'ACCOUNTING DESCRIPTION', 2, 15, 'Friday', '09:00:00', 020.00, 'Management'),"+
																				"('7CCS2KLM', 'Aerodynamics', 'AERODYNAMICS DESCRIPTION', 2, 15, 'Friday', '09:00:00', 020.00, 'Mathematics'),"+
																				"('4SSMN110', 'Economics', 'ECONOMICS DESCRIPTION', 1, 15, 'Tuesday', '13:00:00', 040.00 , 'Management'),"+
																				"('7CCS2TDL', 'Todelete', 'Blah', 1, 15, 'Thursday', '13:00:00', 040.00 , 'Management'),"+
																				"('6CCS1MAL', 'Matrix Algebra', 'MATRIX ALGEBRA DESCRIPTION', 3, 70, 'Thursday', '15:00:00', 025.00 , 'Mathematics')", (err)=>done(err)),											
					 			(done)=>connection.query("INSERT INTO Degree (DegreeTitle, LengthOfStudy) VALUES "+
																				 "('BSc Computer Science', 3),"+
																				 "('MSci Computer Science', 4),"+
																				 "('MSci Biochemistry', 4),"+
																				 "('BSc Computer Science with Management', 3),"+
																				 "('BEng Computer Science with Engineering', 3),"+
																				 "('BSc Biochemistry', 3),"+
																				 "('BSc Mathematics with Finance', 3)", (err)=>done(err)),											 
								(done)=>connection.query("INSERT INTO Tag (TagName, Category) VALUES "+
																				 "('Software Engineer', 'Careers'),"+
																				 "('System Analyst', 'Careers'),"+
																				 "('Data Architect', 'Careers'),"+
																				 "('Business Intelligence Manager', 'Careers'),"+
																				 "('Year 1', NULL),"+
																				 "('Year 2', NULL),"+
																				 "('Year 3', NULL),"+
																				 "('BSc Computer Science with Management', 'Degree'),"+
																				 "('BSc Computer Science', 'Degree'),"+
																				 "('MSci Computer Science', 'Degree'),"+
																				 "('BSc', NULL),"+
																				 "('Internet', 'Careers'),"+
																				 "('Maths', 'Skills'),"+
																				 "('Communication', 'Skills'),"+
																				 "('MSc', NULL),"+
																				 "('Astrology', 'Careers'),"+
																				 "('Physicist', 'Careers'),"+
																				 "('DeleteTag', NULL)" , (err)=>done(err)),											 
					 			(done)=>connection.query("INSERT INTO User (UserID, FName, LName, Password, AccessGroup) VALUES"+
																				 "('admin.email1@kcl.ac.uk', 'Rad', 'Gore', '100100110000111010101000101010101111000001110101000011001010', '0'),"+
																				 "('moderator.email1@kcl.ac.uk', 'Kae', 'Dupuy', '100100110000001010101000101010101111001001110101000011001010', '1'),"+
																				 "('moderator.email2@kcl.ac.uk', 'Adrian', 'Kusiak', '100100110000110111011000101010101111000001110100101011001010', '1'),"+
																				 "('student.email1@kcl.ac.uk', 'Maria', 'Veneva', '100110111001111010101000101010101111000001111001010011001010', '2'),"+
																				 "('student.email2@kcl.ac.uk', 'Tahoor', 'Ahmed', '100110111001111010110000101010101101011001111001010110101010', '2'),"+
																				 "('student.email3@kcl.ac.uk', 'Hani', 'Tawil', '100110111001111110010100101010101110101101111001010110101010', '2'),"+
																				 "('student.email4@kcl.ac.uk', 'Petru', 'Bancila', '100110111001011010101000110100101111000001111001101010101010', '2'),"+
 																				 "('kaedupuy@fake.com','Kaé','Dupuy','"+hash+"',1),"+
																				 "('akusiak@underground.net','Adrian','Kusiak','password',1),"+
																				 "('radgorecha@inlook.org','Radhika','Gorecha','password',2),"+
																				 "('inconito@whoknows.org','Inconito','Who','password',2),"+
																				 "('mariav@mar.s','Maria','Veneva','password',1),"+
																				 "('usain.bolt@gmail.com','Godspeed','Strike','strikingpassword',2),"+
																				 "('testuser','test','user','"+hash2+"',0)", (err)=>done(err)),												 
								(done)=>connection.query("INSERT INTO ModuleTag (ModuleID, TagName) VALUES"+ 
																				 "('4CCS1FC1', 'Data Architect'),"+
																				 "('4CCS1FC1', 'Year 1'),"+
																				 "('4CCS2DBS', 'Data Architect'),"+
																				 "('4CCS2DBS', 'Year 1'),"+
																				 "('4SSMN110', 'BSc Computer Science with Management'),"+
																				 "('5CCS2SEG', 'Software Engineer'),"+
																				 "('5CCS2SEG', 'Year 2'),"+
																				 "('5CCS1INS', 'System Analyst'),"+
																				 "('5SSMN210', 'BSc Computer Science with Management'),"+
																				 "('5CCS2OSC', 'Software Engineer'),"+
																				 "('5SSMN210', 'Business Intelligence Manager'),"+
																				 "('6CCS1MAL', 'Astrology'),"+
																				 "('4CCS1FC1', 'Maths'),"+
																				 "('4SSMN110', 'BSc'),"+
																				 "('5SSMN210', 'BSc'),"+
																				 "('5CCS1INS', 'Internet')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO DegreeModule (DegreeID, ModuleID, IsOptional) VALUES"+ 
																				 "('BSc Computer Science', '4CCS1FC1', false),"+
																				 "('BSc Computer Science', '4CCS2DBS', false),"+
																				 "('MSci Computer Science', '4CCS2DBS', false),"+
																				 "('BSc Computer Science with Management', '4SSMN110', false),"+
																				 "('BSc Computer Science', '5CCS2SEG', false),"+
																				 "('BSc Computer Science', '5CCS1INS', false),"+
																				 "('BSc Computer Science with Management', '5CCS1INS', true),"+
																				 "('BSc Computer Science with Management', '5SSMN210', false),"+
																				 "('BSc Computer Science with Management', '4CCS1FC1', false),"+
																				 "('BSc Biochemistry', '5CCS1INS', true),"+
																				 "('BSc Biochemistry', '5SSMN210', false),"+
																				 "('BSc Biochemistry', '4CCS1FC1', false),"+
																				 "('BSc Biochemistry', '4SSMN110', false),"+
																				 "('MSci Computer Science', '5CCS2SEG', false),"+
																				 "('MSci Biochemistry', '5CCS1INS', false),"+
																				 "('MSci Biochemistry', '6CCS1MAL', false),"+
																				 "('BSc Computer Science with Management', '5CCS2SEG', false)", (err)=>done(err)),												 
								(done)=>connection.query("INSERT INTO UserTracking (UserID, ModuleID) VALUES "+
																				 "('student.email1@kcl.ac.uk', '5CCS2OSC'),"+
																				 "('student.email2@kcl.ac.uk', '5CCS2OSC'),"+
																				 "('student.email2@kcl.ac.uk', '5CCS1INS'),"+
																				 "('student.email3@kcl.ac.uk', '4CCS1FC1'),"+
																				 "('student.email4@kcl.ac.uk', '5CCS2SEG'),"+
																			 	 "('kaedupuy@fake.com', '5CCS1INS'),"+
																			     "('akusiak@underground.net', '5CCS1INS'),"+
																				 "('akusiak@underground.net', '6CCS1MAL'),"+
																				 "('radgorecha@inlook.org', '4CCS2DBS'),"+
																				 "('mariav@mar.s', '4CCS2DBS'),"+
																				 "('testuser', '5CCS1INS')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO ModuleDependency (DegreeID, Dependency, Parent) VALUES "+
																				 "('BSc Computer Science', '6CCS1MAL', '4CCS1FC1'),"+
																				 "('MSci Computer Science', '6CCS1MAL', '4CCS1FC1'),"+
																				 "('BSc Computer Science', '5CCS2SEG', '4CCS2DBS'),"+
																				 "('BSc Computer Science with Management', '5SSMN210', '4SSMN110'),"+
																				 "('BSc Computer Science with Management', '5CCS2SEG', '4CCS2DBS'),"+
																				 "('BSc Biochemistry', '5SSMN210', '4SSMN110'),"+
																				 "('BSc Biochemistry', '5CCS2SEG', '4CCS2DBS'),"+
																				 "('BSc Computer Science', '5CCS1INS', '4CCS2DBS')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO DegreeBuild (DegreeTemplate, Owner) VALUES "+
																				 "('BSc Computer Science', 'student.email1@kcl.ac.uk'),"+
																				 "('BSc Mathematics with Finance', 'student.email1@kcl.ac.uk'),"+
																				 "('BSc Computer Science with Management', 'student.email1@kcl.ac.uk'),"+
																				 "('BSc Computer Science with Management', 'student.email1@kcl.ac.uk'),"+
																				 "('BSc Computer Science with Management', 'student.email2@kcl.ac.uk')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO BuildComponent (BuildID, ModuleID, IsDependent) VALUES "+
																				 "(1, '4CCS1FC1', false),"+
																				 "(1, '4CCS2DBS', false),"+
																				 "(1, '5CCS1INS', true),"+
																				 "(2, '5CCS2SEG', true),"+
																				 "(2, '5SSMN210', true),"+
																				 "(3, '5SSMN210', true),"+
																				 "(3, '4SSMN110', false),"+
																				 "(4, '5SSMN210', true),"+
																				 "(5, '5SSMN210', true),"+
																				 "(5, '4CCS1FC1', false)", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO ModuleRecommendation (DegreeID, ModuleID, Recommendation) VALUES "+
																				 "('BSc Computer Science', '4CCS1FC1', '6CCS1MAL'),"+
																				 "('BSc Computer Science', '5CCS2SEG', '5CCS2OSC'),"+
																				 "('BSc Computer Science', '5CCS2SEG', '4CCS2DBS'),"+
																				 "('BSc Computer Science with Management', '5CCS2SEG', '4CCS2DBS'),"+
																				 "('BSc Computer Science with Management', '4SSMN110', '5SSMN210'),"+
																				 "('MSci Computer Science', '4CCS1FC1', '6CCS1MAL')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO Tracked (TagName, ModuleID, Count) VALUES "+
																				 "('Data Architect', '4CCS2DBS', 1),"+
																				 "('Business Intelligence Manager', '5SSMN210', 1)", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO Feedback (Day, Ratings, Reasons, Comments) VALUES "+
																				 "('2017-03-13', 'Usefulness : 4, Usability : 2, Informative : 3,  Security : 1, "+
																				 "Accessibilty : 5', 'Done using it!', 'Great App'),"+
																				 "('2017-03-12', 'Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, "+
																				 "Accessibilty : 5', 'No time got work to do!', 'Bye'),"+
																				 "('2017-03-17', 'Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, "+
																				 "Accessibilty : 5', 'No time got work to do!', 'Bye'),"+
																				 "('2017-03-14', 'Usefulness : 2, Usability : 2, Informative : 3,  Security : 5, "+
																				 "Accessibilty : 5', 'Found what I want to do', 'GG')", (err)=>done(err)),
								(done)=>connection.query("INSERT INTO ResetToken (Token, ExpiryDate, UserID) VALUES "+
																				"('43f4886f63d41d81fc277fc4dbc028453abe86f4', "+exp1+", 'kaedupuy@fake.com'),"+
																				"('217313efd0d38e644c7ad25a27b68cced6c5ac1c', "+exp2+", 'akusiak@underground.net'),"+
																				"('90f63b756275e3229a72ba830a904d7e680c5837', "+exp3+", 'student.email1@kcl.ac.uk')", (err)=>done(err)),						 														 
								(done)=>connection.query("INSERT INTO Session VALUES "+
																			 	 '(\'kvnQldQE6CUJc72BAyim0xBbhXigFmyv\',1499884455, \'{"cookie":'+
																				 '{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},'+
																				 '"passport":{"user":"testuser"}}\'),'+
																				 '(\'kvnQldQE6CUJc72BAyim0xBbhXigBmyj\',1499884455, \'{"cookie":'+
																				 '{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},'+
																				 '"passport":{"user":"student.email2@kcl.ac.uk"}}\')', (err)=>done(err))],
								(err)=>callback(err, connection)
	);
}

var deleteData = function(connection, callback) {
	async.waterfall([(done)=>connection.query("DROP TABLE IF EXISTS DegreeModule", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS ModuleDependency", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS BuildComponent", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS DegreeBuild", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS ModuleRecommendation", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Degree", (err)=>done(err)),
					 			(done)=>connection.query("DROP TABLE IF EXISTS ModuleTag", (err)=>done(err)),
					 			(done)=>connection.query("DROP TABLE IF EXISTS UserTracking", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Tracked", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Tag", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Module", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS ResetToken", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS User", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Feedback", (err)=>done(err)),
								(done)=>connection.query("DROP TABLE IF EXISTS Session", (err)=>done(err))],
								(err)=>callback(err, connection)
	);
}

var setup = function(cb){
	async.waterfall([
		(callback)=>{console.log('Connecting...'); callback(null);},
		createConnection,
		(connection, callback)=>{console.log('Connected'); callback(null, connection);},
		deleteData,
		(connection, callback)=>{console.log('Dropped'); callback(null, connection);},
		createTables,
		(connection, callback)=>{console.log('Created Tables'); callback(null, connection);},
		insertData],
		(err, connection)=>{
			if(err) {
				if(connection) connection.rollback(connection.release);
				return cb(err);
			}
			connection.commit(function(err){
				if(err) {
					if(connection) connection.rollback(connection.release);
					return cb(err);
				}	
				if(connection) connection.release();
				console.log('Database Refreshed');
				cb();
			});
		}
	);
}

exports.refresh = setup;
											
exports.DEGREE_SUITE_BEFORE_EACH_DATA = {
	tables: {
		Degree: [
		 {DegreeTitle: "BSc Computer Science", LengthOfStudy: 3},
		 {DegreeTitle: "MSci Computer Science", LengthOfStudy: 4},
		 {DegreeTitle: "BSc Computer Science with Management", LengthOfStudy: 3},
		 {DegreeTitle: "BEng Computer Science with Engineering", LengthOfStudy: 3},
		 {DegreeTitle: "BSc Mathematics with Finance", LengthOfStudy: 3},
		],
		User: [
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0},
			{UserID: "akusiak@underground.net", FName: "Adrian", LName: "Kusiak", Password: "password", AccessGroup: 1},
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: 2},
		],
		DegreeModule: [
			{DegreeID: "BSc Computer Science", ModuleID: "4CCS1FC1", IsOptional: false},
			{DegreeID: "BSc Computer Science", ModuleID: "4CCS2DBS", IsOptional: false},
			{DegreeID: "BSc Computer Science", ModuleID: "5CCS2SEG", IsOptional: true},
			{DegreeID: "BSc Computer Science", ModuleID: "5CCS1INS", IsOptional: true},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "4SSMN110", IsOptional: true},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "5CCS1INS", IsOptional: false},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "5SSMN210", IsOptional: true},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "4CCS1FC1", IsOptional: false},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "5CCS2SEG", IsOptional: true},
			{DegreeID: "MSci Computer Science", ModuleID: "5CCS1INS", IsOptional: false},
			{DegreeID: "MSci Computer Science", ModuleID: "6CCS1MAL", IsOptional: false},
		],
		ModuleDependency: [
			{DegreeID: "BSc Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
			{DegreeID: "BSc Computer Science", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
			{DegreeID: "BSc Computer Science", Dependency: "5CCS1INS", Parent: "4CCS2DBS"},
			{DegreeID: "BSc Computer Science with Management", Dependency: "5SSMN210", Parent: "4SSMN110"},
			{DegreeID: "BSc Computer Science with Management", Dependency: "5CCS2SEG", Parent: "4CCS2DBS"},
			{DegreeID: "MSci Computer Science", Dependency: "6CCS1MAL", Parent: "4CCS1FC1"},
		],
		ModuleRecommendation: [
			{DegreeID: "BSc Computer Science", ModuleID: "4CCS1FC1", Recommendation: "6CCS1MAL"},
			{DegreeID: "BSc Computer Science", ModuleID: "5CCS2SEG", Recommendation: "4CCS2DBS"},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "5CCS2SEG", Recommendation: "4CCS2DBS"},
			{DegreeID: "BSc Computer Science with Management", ModuleID: "4SSMN110", Recommendation: "5SSMN210"},
			{DegreeID: "MSci Computer Science", ModuleID: "4CCS1FC1", Recommendation: "6CCS1MAL"},
		],
		DegreeBuild: [
			{DegreeTemplate: "BSc Computer Science", Owner: "student.email2@kcl.ac.uk"},
			{DegreeTemplate: "MSci Computer Science", Owner: "student.email2@kcl.ac.uk"},
		],
		BuildComponent: [
			{BuildID: 1, ModuleID: "4CCS1FC1", IsDependent: false},
			{BuildID: 1, ModuleID: "4CCS2DBS", IsDependent: false},
			{BuildID: 1, ModuleID: "5CCS1INS", IsDependent: true},
		],
		UserTracking: [
			{UserID: "student.email2@kcl.ac.uk", ModuleID: "4CCS2DBS"},
			{UserID: "akusiak@underground.net", ModuleID: "5CCS1INS"},
			{UserID: "akusiak@underground.net", ModuleID: "6CCS1MAL"},
		],
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
		],
	},
}
		

exports.DEGREE_SUITE_BEFORE_DATA = {
	tables: {
		Module: [
		 {ModuleID: "4CCS2DBS", Name: "Database Systems", Description: "DATABASE SYSTEMS DESCRIPTION", Year: 1,
			Credits: 15, LectureDay: "Friday", LectureTime: "11:00:00", CourseworkPercentage: 20, Faculty: "Informatics"},
		 {ModuleID: "4SSMN110", Name: "Economics", Description: "ECONOMICS DESCRIPTION", Year: 1,
			Credits: 15, LectureDay: "Tuesday", LectureTime: "13:00:00", CourseworkPercentage: 40, Faculty: "Management"},
		 {ModuleID: "4CCS1FC1", Name: "Foundations of Computing 1", Description: "FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year: 1,
			Credits: 15, LectureDay: "Monday", LectureTime: "14:00:00", CourseworkPercentage: 0, Faculty: "Informatics"},
		 {ModuleID: "5CCS2SEG", Name: "Software Engineering Group Project", Description: "SOFTWARE ENGINEERING DESCRIPTION", Year: 2,
			Credits: 30, LectureDay: "Monday", LectureTime: "12:00:00", CourseworkPercentage: 85, Faculty: "Informatics"},
		 {ModuleID: "5CCS1INS", Name: "Internet Systems", Description: "INTERNET SYSTEMS DESCRIPTION", Year: 2,
			Credits: 15, LectureDay: "Thursday", LectureTime: "13:00:00", CourseworkPercentage: 20, Faculty: "Informatics"},
		 {ModuleID: "5SSMN210", Name: "Internet Systems", Description: "ACCOUNTING DESCRIPTION", Year: 2,
			Credits: 15, LectureDay: "Friday", LectureTime: "09:00:00", CourseworkPercentage: 20, Faculty: "Management"},
		 {ModuleID: "6CCS1MAL", Name: "Matrix Algebra", Description: "MATRIX ALGEBRA DESCRIPTION", Year: 3,
			Credits: 70, LectureDay: "Thursday", LectureTime: "15:00:00", CourseworkPercentage: 25, Faculty: "Mathematics"},
		],
	},
}

exports.MODULE_SUITE_BEFORE_EACH_DATA = {
	tables: {
		Module: [
			{ModuleID:"4CCS2DBS", Name:"Database Systems", Description:"DATABASE SYSTEMS DESCRIPTION", Year:1, Credits:15, LectureDay:"Friday", LectureTime:"11:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
			{ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics"},
			{ModuleID:"4SSMN110", Name:"Economics", Description:"ECONOMICS DESCRIPTION", Year:1, Credits:15, LectureDay:"Tuesday", LectureTime:"13:00:00", CourseworkPercentage: 40 , Faculty:"Management"},
			{ModuleID:"5CCS2OSC", Name:"Operating Systems and Concurrency", Description:"OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Year:2, Credits:15, LectureDay:"Wednesday", LectureTime:"10:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
			{ModuleID:"5CCS2SEG", Name:"Software Engineering Group Project", Description:"SOFTWARE ENGINEERING DESCRIPTION", Year:2, Credits:30, LectureDay:"Monday", LectureTime:"12:00:00", CourseworkPercentage:85, Faculty:"Informatics"},
			{ModuleID:"5CCS1FC2", Name:"Foundations of Computing 2", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Wednesday", LectureTime:"14:00:00", CourseworkPercentage:0, Faculty:"Informatics"},
		 	{ModuleID:"5CCS1INS", Name:"Internet Systems", Description:"INTERNET SYSTEMS DESCRIPTION", Year:2, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
			{ModuleID:"5SSMN210", Name:"Accounting", Description:"ACCOUNTING DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Management"},
			{ModuleID:"7CCS2KLM", Name:"Aerodynamics", Description:"AERODYNAMICS DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Mathematics"},
			{ModuleID:"7CCS2TDL", Name:"Todelete", Description:"Blah", Year:1, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:40, Faculty:"Management"},	
		],
		UserTracking: [
			{UserID:"student.email1@kcl.ac.uk", ModuleID:"5CCS2OSC"},
			{UserID:"student.email2@kcl.ac.uk", ModuleID:"5CCS2OSC"},
			{UserID:"student.email2@kcl.ac.uk", ModuleID:"5CCS1INS"},
            {UserID:"testuser", ModuleID:"5CCS2OSC"},
		],
		ModuleTag: [
			{ModuleID: "4CCS1FC1", TagName: "Year 1"},
			{ModuleID: "4CCS2DBS", TagName: "Year 1"},
			{ModuleID: "5SSMN210", TagName: "Business Intelligence Manager"},
			{ModuleID: "5SSMN210", TagName: "BSc"},
			{ModuleID: "5CCS2OSC", TagName: "BSc"},
		],
		Tracked: [																	
			{TagName : "Business Intelligence Manager", ModuleID : "5SSMN210", Count : 3},
			{TagName : "BSc", ModuleID : "4CCS1FC1", Count : 2},
			{TagName : "BSc", ModuleID : "5CCS1FC2", Count : 1},
			{TagName : "BSc", ModuleID : "5CCS1INS", Count : 1},
		],
	},     
}

exports.MODULE_SUITE_BEFORE_DATA = {
	tables: {
		User: [
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: 2},
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0},
			{UserID: "student.email1@kcl.ac.uk", FName: "Maria", LName: "Veneva", Password:"100110111001111010101000101010101111000001111001010011001010", AccessGroup:2},
		],
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
		],
		Tag: [
			{TagName: "Business Intelligence Manager", Category: "Careers"},
			{TagName: "BSc", Category: "NULL"},
			{TagName: "Year 1", Category: "NULL"},
		],
	},
}

exports.TAG_SUITE_BEFORE_EACH_DATA = {
	tables: {
		Tag: [
			{TagName: "Business Intelligence Manager", Category: "Careers"},
			{TagName: "Software Engineer", Category: "Careers"},
			{TagName: "System Analyst", Category: "Careers"},
			{TagName: "Data Architect", Category: "Careers"},
			{TagName: "Internet", Category: "Careers"},
			{TagName: "Astrology", Category: "Careers"},
			{TagName: "Physicist", Category: "Careers"},
			{TagName: "BSc Computer Science with Management", Category: "Degree"},
			{TagName: "BSc Computer Science", Category: "Degree"},
			{TagName: "MSci Computer Science", Category: "Degree"},
			{TagName: "Year 1", Category: null},
			{TagName: "Year 2", Category: null},
			{TagName: "Year 3", Category: null},
			{TagName: "BSc", Category: null},
			{TagName: "MSc", Category: null},
			{TagName: "DeleteTag", Category: null},
			{TagName: "Maths", Category: "Skills"},
			{TagName: "Communication", Category: "Skills"},																		
		],
		ModuleTag: [
			{ModuleID: "4CCS1FC1", TagName: "Data Architect"},
			{ModuleID: "4CCS1FC1", TagName: "Year 1"},
			{ModuleID: "4CCS1FC1", TagName: "Maths"},
			{ModuleID: "4CCS2DBS", TagName: "Data Architect"},
			{ModuleID: "4CCS2DBS", TagName: "Year 1"},
			{ModuleID: "5CCS2SEG", TagName: "Software Engineer"},
			{ModuleID: "5CCS2SEG", TagName: "Year 2"},
			{ModuleID: "5CCS1INS", TagName: "System Analyst"},
			{ModuleID: "5SSMN210", TagName: "BSc Computer Science with Management"},
			{ModuleID: "5SSMN210", TagName: "Business Intelligence Manager"},
			{ModuleID: "5SSMN210", TagName: "BSc"},
			{ModuleID: "5CCS2OSC", TagName: "Software Engineer"},
		],
		User: [
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: 2},
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0},
		],
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
		],
		
	},
}

exports.TAG_SUITE_BEFORE_DATA = {
	tables: {
		Module: [
			{ModuleID:"4CCS2DBS", Name:"Database Systems", Description:"DATABASE SYSTEMS DESCRIPTION", Year:1, Credits:15, LectureDay:"Friday", LectureTime:"11:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
			{ModuleID:"4CCS1FC1", Name:"Foundations of Computing 1", Description:"FOUNDATIONS OF COMPUTING 1 DESCRIPTION", Year:1, Credits:15, LectureDay:"Monday", LectureTime:"14:00:00", CourseworkPercentage:0 , Faculty:"Informatics"},
			{ModuleID:"5CCS2OSC", Name:"Operating Systems and Concurrency", Description:"OPERATING SYSTEMS AND CONCURRENCY DESCRIPTION", Year:2, Credits:15, LectureDay:"Wednesday", LectureTime:"10:00:00", CourseworkPercentage:15, Faculty:"Informatics"},
			{ModuleID:"5CCS2SEG", Name:"Software Engineering Group Project", Description:"SOFTWARE ENGINEERING DESCRIPTION", Year:2, Credits:30, LectureDay:"Monday", LectureTime:"12:00:00", CourseworkPercentage:85, Faculty:"Informatics"},
		 	{ModuleID:"5CCS1INS", Name:"Internet Systems", Description:"INTERNET SYSTEMS DESCRIPTION", Year:2, Credits:15, LectureDay:"Thursday", LectureTime:"13:00:00", CourseworkPercentage:20, Faculty:"Informatics"},
			{ModuleID:"5SSMN210", Name:"Accounting", Description:"ACCOUNTING DESCRIPTION", Year:2, Credits:15, LectureDay:"Friday", LectureTime:"09:00:00", CourseworkPercentage:20, Faculty:"Management"},
		],
	},
}



var hash = bcrypt.hashSync('plaintextpassword', 10);
var exp1 = (Date.now() - 3500658)/1000;
var exp2 = (Date.now() + 9999999)/1000;
exports.USER_SUITE_BEFORE_EACH_DATA = {
	tables: {
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
			{SessionID : "LDnQlvQJ6CWJQ72pAsiv0sBghXsgAmy2", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"guest5131483184384sdsds834\"}}"},
		],
		User: [ 
			{UserID: "kaedupuy@fake.com", FName: "Kaé", LName: "Dupuy", Password: ""+hash+"", AccessGroup: "1", SessionLink: null},
			{UserID: "inconito@whoknows.org", FName: "Inconito", LName: "Who", Password: "password", AccessGroup: "2", SessionLink: null},
			{UserID: "usain.bolt@gmail.com", FName: "Godspeed", LName: "Strike", Password: "strikingpassword", AccessGroup: "2", SessionLink: null},
			{UserID: "radgorecha@inlook.org", FName: "Radhika", LName: "Gorecha", Password: "password", AccessGroup: "2", SessionLink: null},
			{UserID: "student.email1@kcl.ac.uk", FName: "Maria", LName: "Veneva", Password: "100110111001111010101000101010101111000001111001010011001010", AccessGroup: "2", SessionLink: null},
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: "2", SessionLink: null},
			{UserID: "student.email3@kcl.ac.uk", FName: "Hani", LName: "Tawil", Password: "100110111001111110010100101010101110101101111001010110101010", AccessGroup: "2", SessionLink: null},
			{UserID: "student.email4@kcl.ac.uk", FName: "Petru", LName: "Bancila", Password: "100110111001011010101000110100101111000001111001101010101010", AccessGroup: "2", SessionLink: null},
			{UserID: "akusiak@underground.net", FName: "Adrian", LName: "Kusiak", Password: "password", AccessGroup : "1", SessionLink: null},
			{UserID: "moderator.email1@kcl.ac.uk", FName: "Kae", LName: "Dupuy", Password: "100100110000001010101000101010101111001001110101000011001010", AccessGroup : "1", SessionLink: null},
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0, SessionLink: null},
			{UserID: "guest5131483184384sdsds834", FName: null, LName: null, Password: null, AccessGroup: 2, SessionLink: "LDnQlvQJ6CWJQ72pAsiv0sBghXsgAmy2"},
		],
		ResetToken: [
			{Token : "43f4886f63d41d81fc277fc4dbc028453abe86f4", ExpiryDate : ""+exp1+"", UserID : "kaedupuy@fake.com"},
			{Token : "217313efd0d38e644c7ad25a27b68cced6c5ac1c", ExpiryDate : ""+exp2+"", UserID : "akusiak@underground.net"},
		],
        UserTracking: [
			{UserID:"student.email1@kcl.ac.uk", ModuleID:"5CCS2OSC"},
			{UserID:"student.email2@kcl.ac.uk", ModuleID:"5CCS2OSC"},
			{UserID:"student.email2@kcl.ac.uk", ModuleID:"5CCS1INS"},
		],
		Feedback:[
			{Day: "2017-03-13", Ratings : "Usefulness : 4, Usability : 2, Informative : 3,  Security : 1, Accessibilty : 5", Reasons: "No time got work to do!", Comments: "Great App"},
			{Day: "2017-03-12", Ratings : "Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5", Reasons: "Done using it!", Comments: "Bye"},
			{Day: "2017-03-17", Ratings : "Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5", Reasons: "No time got work to do!", Comments: "Bye"},
			{Day: "2017-03-14", Ratings : "Usefulness : 2, Usability : 2, Informative : 3,  Security : 5, Accessibilty : 5", Reasons: "Found what I want to do", Comments: "GG"},
		],
		
	},
	
}
	
var hash2 = bcrypt.hashSync('testpassword', 10);

exports.FEEDBACK_SUITE_BEFORE_EACH_DATA = {
	tables : {
		Feedback:[
			{Day: "2017-03-13", Ratings : "Usefulness : 4, Usability : 2, Informative : 3,  Security : 1, Accessibilty : 5", Reasons: "No time got work to do!", Comments: "Great App"},
			{Day: "2017-03-12", Ratings : "Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5", Reasons: "Done using it!", Comments: "Bye"},
			{Day: "2017-03-17", Ratings : "Usefulness : 3, Usability : 5, Informative : 5,  Security : 2, Accessibilty : 5", Reasons: "No time got work to do!", Comments: "Bye"},
			{Day: "2017-03-14", Ratings : "Usefulness : 2, Usability : 2, Informative : 3,  Security : 5, Accessibilty : 5", Reasons: "Found what I want to do", Comments: "GG"},
		],
		User: [
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: 2},
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0},
		],
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
		],
	},

}
var exp4 = (Date.now() + 3500000)/1000;
exports.AUTH_SUITE_BEFORE_EACH_DATA = {
	tables : {
		User: [
			{UserID: "student.email2@kcl.ac.uk", FName: "Tahoor", LName: "Ahmed", Password: "100110111001111010110000101010101101011001111001010110101010", AccessGroup: 2},
			{UserID: "testuser", FName: "test", LName: "user", Password: ""+hash2+"", AccessGroup: 0},
			{UserID: "kaedupuy@fake.com", FName: "Kaé", LName: "Dupuy", Password: ""+hash+"", AccessGroup: 0},
		],
		Session: [
			{SessionID : "kvnQldQE6CUJc72BAyim0xBbhXigFmyv", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"testuser\"}}"},
			{SessionID : "TIYc8UifRhwuRYl4q0ceiGHjokNXpr0v", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"student.email2@kcl.ac.uk\"}}"},
			{SessionID : "UACNeUCkYaZMKXo_GK0AnVKroY27aqIh", Expires : 1499884455, Data: "{\"cookie\":{\"originalMaxAge\":false,\"expires\":false,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"idontexist\"}}"},
		],
		ResetToken: [
			{Token : "43f4886f63d41d81fc277fc4dbc028453abe86f4", ExpiryDate : ""+exp4+"", UserID : "student.email2@kcl.ac.uk"},
			
		],
	},

}


before(function(done){
	this.timeout(0);
	setup(done);
});
