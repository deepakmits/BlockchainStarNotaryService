/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
/* jshint esversion:6 */

const level = require('level');
const chainDB = './chaindata';    //star chain
const db = level(chainDB);
var exports = module.exports;


//Add data to levelDB with key/value pair using promise
function addLevelDBData(key,value){
	return new Promise(function(resolve,reject){
		db.put(key,value,function(err){
			if(err) reject(err);
			else {
				console.log('saving validation request :'+value);
				resolve(value);
			}
		});
	});
}

exports.addLevelDBData = addLevelDBData;

//Get data from levelDB with key
function getLevelDBData(key){
	return new Promise(function(resolve,reject){
		db.get(key, function(err,value){
			if(err) reject(err);
			else {
				console.log('getting validation request :'+value);
				resolve(value);
			}
		});
	});
}


exports.getLevelDBData = getLevelDBData;


//Add data to levelDB with value
function addDataToLevelDB(value) {
	return new Promise(function(resolve,reject){
		let i = 0;
		db.createReadStream().on('data', function(data) {
			i++;
		}).on('error', function(err) {
			console.log('Unable to read data stream!', err);
			reject(err);
		}).on('close', function() {
			console.log('Block #' + i);
			addLevelDBData(i, value);
			resolve(value);
		});
	});
}

exports.addDataToLevelDB = addDataToLevelDB;

//get current count of blocks
function getCountOfEntries() {
	return new Promise(function(resolve,reject){
		let i = 0;
		db.createReadStream().on('data', function() {
			i++;
		}).on('error', function(err) {
			console.log(err.stack);
			reject(err);
		}).on('close', function() {
			resolve(i);
		});
	});
}

exports.getCountOfEntries = getCountOfEntries;






