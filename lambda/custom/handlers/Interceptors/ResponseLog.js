const JSON = require('circular-json');
const { customLog } = require('../../helperFunctions');

const ResponseLog = {
	process(handlerInput) {
		console.log(`RESPONSE BUILDER = ${ JSON.stringify(handlerInput.responseBuilder.getResponse()) }`);
		customLog(handlerInput.responseBuilder.getResponse());
	},
};

module.exports = { ResponseLog };
