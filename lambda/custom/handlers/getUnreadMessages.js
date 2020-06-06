const { ri } = require('@jargon/alexa-skill-sdk');
const { replaceWhitespacesFunc, login, getUnreadCounter, channelUnreadMessages } = require('../helperFunctions');


const GetUnreadMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.readunreadschannel.value;
			const channelName = replaceWhitespacesFunc(channelNameData);

			const headers = await login(accessToken);
			const unreadCount = await getUnreadCounter(channelName, headers);
			const speechText = await channelUnreadMessages(channelName, unreadCount, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	GetUnreadMessagesIntentHandler,
};
