var mysql = require('mysql');
var schema = require('../../database_setup.js');
var async = require('async');

/**
 *@module MySQL Config
 */

/**
 * Configuration file for establishing a MySQL connection pool.
 */

/**
 *  Variable representing the production database's options.
 */
var productionOptions = {
	host : process.env.DATABASE_HOST || 'localhost',
	user : process.env.DATABASE_USER || 'root',
	password :	process.env.DATABASE_PASS || '',
	database : process.env.DATABASE_URL || 'module_selection',
	users_table : 'User'
}

/**
 *  Variable representing the test database's options.
 */
var testOptions = {
	host : 'localhost',
	user : 'root',
	password :	'',
	database : 'app_test_database',
	users_table : 'User'
}

/**
 *  Variable representing the test mode of the database.
 */
exports.TEST_MODE = 'test_mode';

/**
 *  Variable representing the production mode of the database.
 */
exports.PRODUCTION_MODE = 'production_mode';

/**
 *  Variable representing the state of the database, with the pool and the mode of the database.
 */
var state = {
  pool: null,
  mode: null,
}

/**
 * Function for connecting to a database.
 * @param {string} mode - The mode in which the program is started with : production or test.
 * @param {function} callback - What to do with the result of the function.
 */
var connectDatabase = function(mode, callback) {
  if(!state.pool || state.mode !== mode){
		state.pool = mysql.createPool(
			(mode == exports.PRODUCTION_MODE ? productionOptions : testOptions)
		);
	
		state.mode = mode;
	}

 	if(mode == 'production_mode'){
			schema.refresh(callback);
	}else{
		callback();
	}
}

/**
 * Function for retrieving the connection to the database.
 * If the connection is missing sends error Missing database connection.
 * @param {function} callback - What to do with the result of the function.
 */
var getConnection = function(callback) {
		if(!state.pool) return callback(new Error('Missing database connection.'));   
		state.pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

/**
 * Function for populating the database.
 * If the connection is missing sends error Missing database connection.
 * @param {object} data - The data to be inserted in the database.
 * @param {function} callback - What to do with the result of the function.
 */
var populate = function(data, callback) {
  if (!state.pool) return callback(new Error('Missing database connection.'));

  var names = Object.keys(data.tables)
  async.eachSeries(names, function(name, cb) {
		var keys = Object.keys(data.tables[name][0]);
    async.mapSeries(data.tables[name], function(row, cb) {
      var keys = Object.keys(row)
        , values = keys.map(function(key) { return row[key]})
			 cb(null, values);
      
    }, (err, data)=>{state.pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES ?',[data], cb);});
  }, callback)
}

/**
 * Function for deleting the tables in the database.
 * If the connection is missing sends error Missing database connection.
 * @param {json_object} tables - The tables to be deleted from the database.
 * @param {function} callback - What to do with the result of the function.
 */
var drop = function(tables, callback) {
  if (!state.pool) return callback(new Error('Missing database connection.'))
	var connectionHandle;
	async.waterfall([(done)=>getConnection((err, conn)=>{connectionHandle = conn; done(err,conn);}),
									(connection, done)=>async.eachSeries(tables, (name, cb)=>
																				async.series([(doneInner)=>connection.query('DELETE FROM ' + name, doneInner),
																											(doneInner)=>connection.query('ALTER TABLE ' + name +' AUTO_INCREMENT = 1', doneInner)], cb), done)]
		, (err)=>{ if(connectionHandle) connectionHandle.release(); callback(err)});
  
}

exports.state = state;
exports.connect = connectDatabase;
exports.getConnection = getConnection;
exports.populate = populate;
exports.clear = drop;

