const { ri } = require('@jargon/alexa-skill-sdk');
const { resolveChannelname, login, getUnreadCounter, channelUnreadMessages, getGroupUnreadCounter, groupUnreadMessages } = require('../../helperFunctions');


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

			const headers = await login(accessToken);
			const response = await resolveChannelname(handlerInput.requestEnvelope.request.intent.slots.readunreadschannel.value, headers);
			const room = response[0];
			let speechText;
			if (room.type === 'c') {
				const unreadCount = await getUnreadCounter(room.name, headers);
				speechText = await channelUnreadMessages(room.name, unreadCount, headers);
			} else {
				const unreadCount = await getGroupUnreadCounter(room.id, headers);
				speechText = await groupUnreadMessages(room.name, room.id, unreadCount, headers);
			}

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
