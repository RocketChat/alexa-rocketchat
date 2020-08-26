const { ri } = require('@jargon/alexa-skill-sdk');

const helperFunctions = require('../../helperFunctions');

const GetMentionsIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'GetMentionsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.getAllUnreadMentions(headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	GetMentionsIntentHandler,
};
