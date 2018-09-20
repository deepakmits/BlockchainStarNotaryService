'use strict';

const Inert = require('inert');
const Vision = require('vision');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Hapi=require('hapi');
const Blockchain = require('./Blockchain');
const Block = require('./Block');
const deepChain = new Blockchain();
const ValidationRequest = require('./ValidationRequest');
const ldb = require('./levelSandbox');
const bitcoinMessage = require('bitcoinjs-message');

//Create a server with a host and port
const server=Hapi.server({
	host:'localhost',
	port:8000
});

const swaggerOptions = {
		info: {
			'title': 'Blockchain Star Notary Service API Documentation',
			'version': '0.0.1',
		}
};


//Add the route
server.route({
	method:'GET',
	path:'/hello',
	config:{
		handler:function(request,h) {

			return'hello world';
		},
		tags: ['api'],
		description: 'Hello World',
		notes: 'First hapi program',
	}
});


//Get complete Blockchain as JSON
//http://localhost:8000/chain
server.route({
	method:'GET',
	path:'/chain',
	config:{
		tags: ['api'],
		description: 'Get complete blockchain as JSON',
		handler:async (request,h) => {
			let fullBlockchain = [];
			let currentBlockchainHeight = await deepChain.getBlockHeight().then((currHeight) =>{
				return currHeight;
			});
			console.log(currentBlockchainHeight);
			for(let i=0;i<=currentBlockchainHeight;i++){
				let currBlock = await deepChain.getBlock(i).then((block) => {
					return block;
				});
				fullBlockchain.push(currBlock);
			}
			return h.response(fullBlockchain).type('application/json');
		}
	}
});



//http://localhost:8000/stars/address/{address}
server.route({
	method:'GET',
	path:'/stars/address/{address}',
	config:{
		tags: ['api'],
		description: 'Get Stars registered with given wallet address.',
		notes: 'Get list of stars registered with given wallet address.',
		validate: {
			params: {
				address : Joi.string()
				.required(),
			}
		},
		
		handler:async (request,h) => {
			let stars = [];
			let add = request.params.address;
			let currentBlockchainHeight = await deepChain.getBlockHeight().then((currHeight) =>{
				return currHeight;
			});
			console.log(currentBlockchainHeight);
			for(let i=0;i<=currentBlockchainHeight;i++){
				let currBlock = await deepChain.getBlock(i).then((block) => {
					return block;
				});
				console.log('Address : '+JSON.stringify(currBlock));
				if(currBlock.body.address === add){
					var storyDecode = new Buffer(currBlock.body.star.story, 'hex');
					currBlock.body.star.storyDecode = storyDecode.toString();
					stars.push(currBlock);
				}
			}
			return h.response(JSON.stringify(stars)).type('application/json');
		}
	}
});


//http://localhost:8000/stars/hash/{hash}
server.route({
	method:'GET',
	path:'/stars/hash/{hash}',
	config:{
		tags: ['api'],
		description: 'Get Star registered with given hash.',
		notes: 'Get Star registered with given hash.',
		validate: {
			params: {
				hash : Joi.string()
				.required(),
			}
		},
		
		handler:async (request,h) => {
			let hash = request.params.hash;
			let retBlock = null;
			let currentBlockchainHeight = await deepChain.getBlockHeight().then((currHeight) =>{
				return currHeight;
			});
			console.log(currentBlockchainHeight);
			
			for(let i=0;i<=currentBlockchainHeight;i++){
				let currBlock = await deepChain.getBlock(i).then((block) => {
					return block;
				});
				
				console.log('Hash : '+JSON.stringify(currBlock));
				if(currBlock.hash === hash){
					var storyDecode = new Buffer(currBlock.body.star.story, 'hex');
					currBlock.body.star.storyDecode = storyDecode.toString();
					retBlock = currBlock;
				}
			}
			return h.response(JSON.stringify(retBlock)).type('application/json');
		}
	}
});


//http://localhost:8000/chain/validate
server.route({
	method:'GET',
	path:'/chain/validate',
	config:{
		tags: ['api'],
		description: 'Validates complete blockchain.',
		notes: 'Validates current block and current block hash with next previous block hash',
		handler:async (request,h) => {
			let logs = await deepChain.validateChain().then((errorLog)=>{
				return errorLog;
			});
			console.log(logs);
			return h.response(logs).type('application/json');
		}
	}
});

//http://localhost:8000/chain/block/0 
//server.route({
//	method:'GET',
//	path:'/chain/block/{height}',
//	config:{
//		tags: ['api'],
//		description: 'Get Block at a given height',
//		notes: 'Get Block at a given height, returns Block as JSON',
//		validate: {
//			params: {
//				height : Joi.number()
//				.required(),
//			}
//		},
//		handler:async (request, h) => {
//			let height = encodeURIComponent(request.params.height);
//			let retBlock = await deepChain.getBlock(height).then((block) => {
//				return block;
//			}).catch((err) => {
//				console.log('Deep chain could not find required block '+height , err);
//				return errorHandler(request, h, 'Deep chain could not find required block '+height);
//			});
//
//			return h.response(retBlock).type('application/json');
//		}
//	}
//});


//http://localhost:8000/chain/block/0 
server.route({
	method:'GET',
	path:'/stars/block/{height}',
	config:{
		tags: ['api'],
		description: 'Get Star at a given height',
		notes: 'Get Star at a given height, returns Star as JSON',
		validate: {
			params: {
				height : Joi.number()
				.required(),
			}
		},
		handler:async (request, h) => {
			let height = encodeURIComponent(request.params.height);
			let retBlock = await deepChain.getBlock(height).then((block) => {
				var storyDecode = new Buffer(block.body.star.story, 'hex');
				block.body.star.storyDecode = storyDecode.toString();
				return block;
			}).catch((err) => {
				console.log('Deep chain could not find required block '+height , err);
				return errorHandler(request, h, 'Deep chain could not find required block '+height);
			});

			return h.response(retBlock).type('application/json');
		}
	}
});


//http://localhost:8000/chain/block
server.route({
	method:'POST',
	path:'/block',
	config:{
		tags: ['api'],
		description: 'Add Block to current Blockchain',
		notes: 'Adds Block to current Blockchain, passing a block data as payload => {"body":"Block data"}',
		validate: {
			payload: {
				body : Joi.object()
				.required(),
			}
		},
		handler:async (request, h) => {
			if(request.payload == null || 
					(request.payload != null && (typeof request.payload.body  == 'undefined' 
						|| encodeURIComponent(request.payload.body).length == 0))
			)
				return errorHandler(request, h, 'Block with empty body cannot be created/added.');

			let blockBody = request.payload.body;
			blockBody.star.story = new Buffer(blockBody.star.story).toString('hex');
			let newBlock = new Block(blockBody);
			let retBlock = await deepChain.addBlock(newBlock).then((block) => {
				return block;
			}).catch((err) => {
				console.log('Deep chain could not add block', err);
				return errorHandler(request, h, 'Deep chain could not add block '+err);
			});

			return h.response(retBlock).type('application/json');
		}
	}
});




//http://localhost:8000/chain/message-signature/validate
server.route({
	method:'POST',
	path:'/chain/message-signature/validate',
	config:{
		tags: ['api'],
		description: 'Validates the signature and establishes identity of submitter.',
		notes: 'Validates the signature using bitcoin verify',
		validate: {
			payload: {
				address : Joi.string()
				.required(),
				signature : Joi.string()
				.required(),
			}
		},
		handler:async (request, h) => {
			if(request.payload == null || 
					(request.payload != null && (request.payload.address  === undefined ||
							encodeURIComponent(request.payload.address).length == 0) ||
							(request.payload.signature  === undefined ||
									(request.payload.signature).length == 0))
			)
				return errorHandler(request, h, 'Wallet address and signature are required to be passed.');

			let address = encodeURIComponent(request.payload.address);
			let signature = request.payload.signature;
			//get exsiting validation request by address
			let existingValidationReq = await deepChain.getBlock(address).then((block) => {
				console.log('got block with address : '+block);
				if(block.address === '')
					return null;
				return block;
			}).catch((err) => {
				console.log('Deep chain could not get validation request block', err);
			});
			console.log("got requested block : "+JSON.stringify(existingValidationReq));
			let jsonResponse = null;
			if(existingValidationReq != null){
				let existingVR = new ValidationRequest(existingValidationReq.address);

				existingVR.initFromExistingValidationRequest(existingValidationReq.requestTimeStamp,
						existingValidationReq.message,existingValidationReq.validationWindow);

				if(existingVR.isRequestValid()){
					console.log('Valid Request');
					let verified = false;
					try{
						verified = bitcoinMessage.verify(existingVR.message,address,signature);
						console.log('verified'+verified);
					}catch(err){
						console.log(err);
						errorHandler(request, h, 'Message could not be verified with Address and Signature.',err);
					}
					if(verified){
						console.log('got request : '+JSON.stringify(existingVR));
						jsonResponse = {
								"registerStar": true,
								"status": {
									"address": address,
									"requestTimeStamp": existingVR.requestTimeStamp,
									"message": existingVR.message,
									"validationWindow": existingVR.validationWindow,
									"messageSignature": "valid"
								}
						}
					}else{
						jsonResponse = {
								"registerStar": false,
								"status": {
									"address": address,
									"requestTimeStamp": existingVR.requestTimeStamp,
									"message": existingVR.message,
									"validationWindow": existingVR.validationWindow,
									"messageSignature": "invalid"
								}
						}
					}
				}else{
					errorHandler(request, h, 'Valid Request not found.');
				}
			}else{
				errorHandler(request, h, 'No validation request is found. Please create validation request first. ');
			}
			return h.response(jsonResponse).type('application/json');
		}
	}
});



//http://localhost:8000/chain/requestValidation
server.route({
	method:'POST',
	path:'/chain/requestValidation',
	config:{
		tags: ['api'],
		description: 'Adds validation request and returns the validation request',
		notes: 'looks for the validation request corresponding to address, adds it if not present.',
		validate: {
			payload: {
				address : Joi.string()
				.required(),
			}
		},
		handler:async (request, h) => {
			if(request.payload == null || 
					(request.payload != null && (request.payload.address  === undefined
							|| encodeURIComponent(request.payload.address).length == 0))
			)
				return errorHandler(request, h, 'Walllet address is required to be passed.');

			let address = encodeURIComponent(request.payload.address);
			let validationRequest = await deepChain.getBlock(address).then((block) => {
				console.log('got block with address : '+block);
				if(block.address === '')
					return null;
				return block;
			}).catch((err) => {
				console.log('Deep chain could not add validation request block', err);
			});
			//console.log('type of '+typeof validationRequest);
			if(validationRequest === null || typeof validationRequest === 'undefined'){
				validationRequest = new ValidationRequest(address);
				console.log('New Valiation Request to be added : '+JSON.stringify(validationRequest));
			}else{
				let valReq = new ValidationRequest(validationRequest.address);

				valReq.requestTimeStamp = validationRequest.requestTimeStamp;
				valReq.message = validationRequest.message;
				valReq.validationWindow = validationRequest.validationWindow;
				if(valReq.isRequestValid())
					valReq.updateValidationRequest();
				else{
					console.log('Setting address to empty as request is not valid.');
					valReq.address = '';
				}
				validationRequest = valReq;
			}
			let val = await ldb.addLevelDBData(address, JSON.stringify(validationRequest)).then((value)=>{
				return value;
			}).catch((err => {
				console.log();
				errorHandler(request, h, 'Validation Request could not be added ',err);
			}));
			return h.response(val).type('application/json');
		}
	}
});


function errorHandler(request, h, errMsg) {
	return  h.response(errMsg).type('application/json');
}
//Start the server
async function start() {
	try {
		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
			]);
		await server.start();
	}
	catch (err) {
		console.log(err);
		process.exit(1);
	}

	console.log('Server running at:', server.info.uri);
}

start();