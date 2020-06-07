const JSON = require('circular-json');
const { customLog } = require('./helperFunctions');

const RequestLog = {
	process(handlerInput) {
		console.log(`REQUEST ENVELOPE = ${ JSON.stringify(handlerInput.requestEnvelope) }`);
		customLog(handlerInput.requestEnvelope);
	},
};

const ResponseLog = {
	process(handlerInput) {
		console.log(`RESPONSE BUILDER = ${ JSON.stringify(handlerInput) }`);
		customLog(handlerInput.requestEnvelope);
	},
};

module.exports = {
	RequestLog,
	ResponseLog,
};
