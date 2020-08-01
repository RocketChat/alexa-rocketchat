const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, readPinnedMessages } = require('../../helperFunctions');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');

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

			// if there were any pinned messages helper function would return an array, otherwise there are no pinned messages
			if (!Array.isArray(pinnedMessages)) {
				const data = {
					title: '',
					message: handlerInput.translate(pinnedMessages.key, pinnedMessages.params),
				};
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(pinnedMessages)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective(titleMessageBoxTemplate(data))
					.getResponse();

			}

			const no_of_pinned_messages = pinnedMessages.length;

			const speechText = ri('PINNED_MESSAGES.SUCCESS', { no_of_pinned_messages, channelname: resolvedChannelDetails[0].name, username: pinnedMessages[no_of_pinned_messages - 1][0], message: pinnedMessages[no_of_pinned_messages - 1][1] });

			let apltext = '';

			for (const message of pinnedMessages) {
				apltext += `<b>${ message[0] }:</b>${ message[1] }<br><br>`;
			}

			const data = {
				title: `Pinned Messages in ${ resolvedChannelDetails[0].name }: ${ pinnedMessages.length }`,
				message: apltext,
			};

			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.addDirective(titleMessageBoxTemplate(data))
				.getResponse();

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	ReadPinnedMessagesIntentHandler,
};
