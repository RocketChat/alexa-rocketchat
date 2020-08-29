const { resolveChannelname, login, roomUnreadMessages, getUnreadCounter, getGroupUnreadCounter } = require('../../helperFunctions');
const { ri } = require('@jargon/alexa-skill-sdk');

const ReadUnreadsFromRoomIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsFromRoomIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const roomname = handlerInput.requestEnvelope.request.intent.slots.roomname.value;
			const roomDetails = await resolveChannelname(roomname, headers, true);

			let unreadCount;
			if (roomDetails[0].type === 'c') {
				unreadCount = await getUnreadCounter(roomDetails[0].name, headers);
			} else {
				unreadCount = await getGroupUnreadCounter(roomDetails[0].id, headers);
			}

			const speechText = await roomUnreadMessages(roomDetails[0].name, unreadCount, roomDetails[0].type, headers, handlerInput);

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
	ReadUnreadsFromRoomIntentHandler,
};
