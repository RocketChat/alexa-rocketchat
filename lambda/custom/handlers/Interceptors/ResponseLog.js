const JSON = require('circular-json');
const { customLog } = require('../../helperFunctions');

const ResponseLog = {
	process(handlerInput) {
		console.log(`RESPONSE BUILDER = ${ JSON.stringify(handlerInput) }`);
		customLog(handlerInput.requestEnvelope);
	},
};

module.exports = { ResponseLog };
