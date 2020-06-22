
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, readPinnedMessages } = require('../../helperFunctions');

const ReadPinnedMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'ReadPinnedMessagesIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);
			const resolvedChannelDetails = await resolveChannelname(handlerInput.requestEnvelope.request.intent.slots.channelname.value, headers, true);

			const pinnedMessages = await readPinnedMessages(resolvedChannelDetails[0].id, resolvedChannelDetails[0].name, headers);

			if (!Array.isArray(pinnedMessages)) {
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(pinnedMessages)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();

			}

			pinnedMessages.sort((a, b) => a[1].length - b[1].length);

			let resultForSpeech;
			const no_of_pinned_messages = pinnedMessages.length;
			if (no_of_pinned_messages <= 3) {
				resultForSpeech = [...pinnedMessages];
			} else {
				resultForSpeech = pinnedMessages.slice(0, 3);
			}

			const reads = [];

			const max = 150;
			let count = 0;

			for (const message of resultForSpeech) {
				const len = (max - count) / (resultForSpeech.length - reads.length);
				if (message[1].length <= len) {
					reads.push(message);
					count += message[1].length;
				} else {
					count += len;
					reads.push([message[0], `${ message[1].slice(0, len) }, and so on`]);
				}
			}

			let pinned_messages = '';
			for (const read of reads) {
				pinned_messages += `${ read[0] } says, ${ read[1] }. `;
			}

			let speechText;
			if (no_of_pinned_messages <= 3) {
				speechText = ri('PINNED_MESSAGES.SUCCESS_ALL', { channelname: resolvedChannelDetails[0].name, pinned_messages });
			} else {
				speechText = ri('PINNED_MESSAGES.SUCCESS_FEW', { no_of_pinned_messages, channelname: resolvedChannelDetails[0].name, pinned_messages });
			}

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
	ReadPinnedMessagesIntentHandler,
};
