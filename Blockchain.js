/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
/* jshint esversion:6 */

const SHA256 = require('crypto-js/sha256');
const ldb = require('./levelSandbox');
const Block =  require('./Block');


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
	constructor(){
		this.getBlockHeight().then((ht)=>{
			if(ht < 0){
				console.log('Creating genesis block...');
				let genesisBlock = new Block('Genesis Block');
				genesisBlock.height = 0;
				genesisBlock.time = new Date().getTime().toString().slice(0,-3);
				genesisBlock.previousBlockHash = "";
				genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
				console.log('going to add genesis block...');
				//add to ldb 
				ldb.addDataToLevelDB(JSON.stringify(genesisBlock).toString()).then((block)=>{
					console.log('Blockchain created with genesis block');
				}).catch((err)=>{
					console.log('Blockchain couldnot be created',err);
				});
			}
		}).catch((err)=>{
			console.log('Could not get height of blockchain',err);
		});

	}


	//adding newBlock to current blockchain at height + 1
	addBlock(newBlock){
		return new Promise((resolve,reject)=>{
			this.getBlockHeight().then((ht)=>{
				// Block height
				newBlock.height = ht+1;
				// UTC timestamp
				newBlock.time = new Date().getTime().toString().slice(0,-3);
				this.getBlock(ht).then((prevBlock)=>{
					// previous block hash
					newBlock.previousBlockHash = prevBlock.hash;
					// Block hash with SHA256 using newBlock and converting to a string
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					// Adding block object to chain/DB
					ldb.addDataToLevelDB(JSON.stringify(newBlock).toString()).then((block)=>{
						console.log('BLOCK ADDED : '+block);
						resolve(block);
					}).catch((err)=>{
						console.log('Could not add new block '+newBlock,err);
						reject(err);
					});
				}).catch((err)=>{
					console.log('Could not get previous block '+err);
					reject(err);
				});
			}).catch((err)=>{
				console.log('Could not get height '+err);
				reject(err);
			});
		});
	}
	
	//get current block height of saved block chain
	getBlockHeight(){
		return new Promise(function(resolve,reject){
			ldb.getCountOfEntries().then(function(count){
				resolve(count-1);
			}).catch(function(err){
				console.log('Couldnot get count of entries');
				reject(err);
			});
		});
	}



	//get block present on given height
	getBlock(blockHeight){
		return new Promise((resolve,reject)=>{
			ldb.getLevelDBData(blockHeight).then(function(value){
				resolve(JSON.parse(value));
			}).catch((err)=>{
				console.log('Couldnot get block of entries');
				reject(err);
			});
		});

	}



	//validating current block chain using async - await here
	async validateChain(){
		let errorLog = [];
		try {
			//wait till we get block height
			const blockHeight = await this.getBlockHeight();

			//wait till we validate links between blocks in pairs
			let linkErrorLogs =  await this.validateLink(blockHeight);
			errorLog.concat(linkErrorLogs);

			//wait till each block is validated
			let eachBlockLogs = await this.validateEachBlock(blockHeight);
			errorLog.concat(eachBlockLogs);
		} catch (err) {
			console.log('validateChain Got error:', err);
		}

		if (errorLog.length>0) {
			console.log('Block errors = ' + errorLog.length);
			console.log('Blocks: '+errorLog);
		} else {
			console.log('No errors detected');
			errorLog.push('No errors detected');
		}
		return errorLog;
	}

	//validating - matching current block to next block
	async validateLink(height){
		let errorLog = [];
		for (let i = 0; i < height; i++) {
			try {
				//wait till we get current block i
				let currBlock = await this.getBlock(i);

				//wait till we get next block i+1
				let nextBlock = await this.getBlock(i+1);

				//match current block hash with next block prev block hash
				if (currBlock.hash !== nextBlock.previousBlockHash) {
					errorLog.push(i);
				}else
					console.log('No issue in link between '+i+' and '+(i+1));
			} catch (err) {
				console.log('validateLink: Got error ', err);
			}
		}
		return errorLog;
	}

	//validating each block of block chain
	async validateEachBlock(height){
		let errorLog = [];
		for (let i = 0; i <= height; i++) {
			try {
				//wait till we validate(check integrity) current block
				await this.validateBlock(i);
			} catch (err) {
				console.log('validateEachBlock: Got error', err);
				errorLog.push(i);
			}
		}
		return errorLog;
	}


	//checking integrity of current block
	validateBlock(blockHeight){
		return new Promise((resolve,reject)=>{
			//get block from DB
			this.getBlock(blockHeight).then((block)=>{
				//preserve block hash
				console.log('BLOCK HASH '+block.hash);
				let blockHash = block.hash;
				//remove hash from current block
				block.hash = '';
				let validBlockHash = SHA256(JSON.stringify(block)).toString();
				// Compare preserved block hash with actual block hash
				if (validBlockHash===blockHash) {
					console.log('No issue with block '+blockHeight);
					resolve(true);
				} else {
					reject('Block #'+blockHeight+' not matching :\n'+blockHash+'<>'+validBlockHash);
				}
			}).catch((err)=>{
				console.log('Could not get block at blockHeight '+blockHeight);
				reject(err);
			});
		});
	}

}

module.exports = Blockchain;


