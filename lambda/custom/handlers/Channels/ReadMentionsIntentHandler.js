const { ri } = require('@jargon/alexa-skill-sdk');

const helperFunctions = require('../../helperFunctions');

const ReadMentionsIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ReadMentionsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await helperFunctions.login(accessToken);

			const channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
			const bestMatchingChannel = await helperFunctions.resolveChannelname(channelName, headers, true);
			const channel = bestMatchingChannel[0];

			let count;
			if (channel.type === 'c') {
				count = await helperFunctions.getUnreadMentionsCountChannel(channel.name, headers);
			} else {
				count = await helperFunctions.getUnreadMentionsCountGroup(channel.id, headers);
			}

			const speechText = await helperFunctions.readUnreadMentions(channel.id, channel.name, count, headers);
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
	ReadMentionsIntentHandler,
};
