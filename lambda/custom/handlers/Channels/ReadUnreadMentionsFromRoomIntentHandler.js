const { resolveChannelname, login, getRoomCounters, readRoomUnreadMentions } = require('../../helperFunctions');
const { ri } = require('@jargon/alexa-skill-sdk');

const ReadUnreadMentionsFromRoomIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadMentionsFromRoomIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const roomname = handlerInput.requestEnvelope.request.intent.slots.roomname.value;
			const roomDetails = await resolveChannelname(roomname, headers, true);

			const roomCounters = await getRoomCounters(roomDetails[0].id, roomDetails[0].type, headers);
			const speechText = await readRoomUnreadMentions(roomDetails[0], roomCounters.userMentions, headers);

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
	ReadUnreadMentionsFromRoomIntentHandler,
};
