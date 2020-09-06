const { resolveDiscussion, login, roomUnreadMessages, getUnreadCounter, getGroupUnreadCounter } = require('../../helperFunctions');
const { ri } = require('@jargon/alexa-skill-sdk');

const ReadUnreadsFromDiscussionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsFromDiscussionIntent';
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
				let unreadCount;
				if (discussionDetails.type === 'c') {
					unreadCount = await getUnreadCounter(discussionDetails.name, headers);
				} else {
					unreadCount = await getGroupUnreadCounter(discussionDetails.id, headers);
				}

				speechText = await roomUnreadMessages(discussionDetails.name, unreadCount, discussionDetails.type, headers, handlerInput, discussionDetails.fname);
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
	ReadUnreadsFromDiscussionIntentHandler,
};
