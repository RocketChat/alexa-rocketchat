const { login, DMUnreadMessages, resolveUsername, getDMCounter } = require('../../helperFunctions');
const { ri } = require('@jargon/alexa-skill-sdk');

const ReadUnreadsFromDMIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsFromDMIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const username = handlerInput.requestEnvelope.request.intent.slots.username.value;
			const userDetails = await resolveUsername(username, headers, true);

			const unreadCount = await getDMCounter(userDetails[0].rid, headers);

			// eslint-disable-next-line new-cap
			const speechText = await DMUnreadMessages(userDetails[0].name, unreadCount.unreads, headers);

			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();

		} catch (err) {
			const speechText = ri('SOMETHING_WENT_WRONG');
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
		}
	},
};

module.exports = {
	ReadUnreadsFromDMIntentHandler,
};
