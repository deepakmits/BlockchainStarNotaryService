/* ===== ValidationRequest Class ==============================
|  Class to construct validationRequest object			   |

{
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
}
|  ===============================================*/
const defaultWindow = 300;

class ValidationRequest{
	constructor(address){
		this.address = address;		
		this.requestTimeStamp = this.currentTimeStamp();
		this.message = this.generateMessage();
		this.validationWindow = defaultWindow;
	}
	
	initFromExistingValidationRequest(requestTimeStamp,message,validationWindow){
		this.requestTimeStamp = requestTimeStamp;
		this.message = message;
		this.validationWindow = validationWindow;
	}


	/**
	 * get current timestamp
	 */
	currentTimeStamp(){
		return new Date().getTime().toString().slice(0,-3);
	}


	/**
	 *  generate request message
	 */
	generateMessage(){
		return this.address + ":" + this.requestTimeStamp +":" + "starRegistry";
	}


	/**
	 * get remaining time window
	 */
	remainingTimeWindow(){
		let time = (parseInt(this.requestTimeStamp, 10) + this.validationWindow) - this.currentTimeStamp();
		return time;
	}


	/**
	 * true if request is still valid
	 */
	isRequestValid(){
		console.log("checking validity"+this.remainingTimeWindow() >= 0);
		return this.remainingTimeWindow() >= 0;
	}


	/**
	 * updating in case of resubmitting request
	 */
	updateValidationRequest(){
		this.validationWindow = this.remainingTimeWindow();
		this.requestTimeStamp = this.currentTimeStamp();
		this.message = this.generateMessage();
	}

}


module.exports = ValidationRequest;