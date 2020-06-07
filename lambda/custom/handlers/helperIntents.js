const { ri } = require('@jargon/alexa-skill-sdk');
const { customLog } = require('../helperFunctions');

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${ handlerInput.requestEnvelope.request.reason }`);
		customLog({ session_ended_reason: handlerInput.requestEnvelope.request.reason });

		return handlerInput.responseBuilder
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR',
			})
			.getResponse();
	},
};

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
	SessionEndedRequestHandler,
	ErrorHandler,
};
