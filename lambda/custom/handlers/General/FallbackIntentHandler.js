const { ri } = require('@jargon/alexa-skill-sdk');

const FallbackIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
	},
	handle(handlerInput) {
		const speechText = ri('FALLBACK_MSG');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

module.exports = {
	FallbackIntentHandler,
};
