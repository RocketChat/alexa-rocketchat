const { resolveDiscussion, login, readRoomUnreadMentions, getRoomCounters } = require('../../helperFunctions');
const { ri } = require('@jargon/alexa-skill-sdk');

const ReadUnreadMentionsFromDiscussionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadMentionsFromDiscussionIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const discussionname = handlerInput.requestEnvelope.request.intent.slots.discussionname.value;
			const discussionDetails = await resolveDiscussion(discussionname, headers);

			let speechText;
			if (!discussionDetails) {
				speechText = ri('NO_ACTIVE_DISCUSSION', { name: discussionname });
			} else {
				const roomCounters = await getRoomCounters(discussionDetails.id, discussionDetails.type, headers);
				speechText = await readRoomUnreadMentions(discussionDetails, roomCounters.userMentions, headers, discussionDetails.fname);
			}

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
	ReadUnreadMentionsFromDiscussionIntentHandler,
};
