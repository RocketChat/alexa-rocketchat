const { ri } = require('@jargon/alexa-skill-sdk');
const { customLog } = require('../../helperFunctions');

const ErrorHandler = {
	canHandle() {
		return true;
	},
	async handle(handlerInput, error) {
		console.log(`Error handled: ${ error.message }`);
		customLog({ errorMessage: error.message });
		const speechText = ri('ERRORS');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	},
};

module.exports = {
	ErrorHandler,
};
