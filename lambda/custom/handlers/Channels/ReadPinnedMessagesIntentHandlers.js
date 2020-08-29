const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, readPinnedMessages } = require('../../helperFunctions');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');
const { supportsAPL } = require('../../utils');

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
				// if there are no pinned message display the speech text in APL
				const repromptText = ri('GENERIC_REPROMPT');
				if (supportsAPL(handlerInput)) {
					const data = {
						title: '',
						message: handlerInput.translate(pinnedMessages.key, pinnedMessages.params),
					};

					return handlerInput.jrb
						.speak(pinnedMessages)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageBoxTemplate(data))
						.getResponse();
				}

				return handlerInput.jrb
					.speak(pinnedMessages)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();

			}

			// if there are pinned messages display the pinned messages in the APL

			const no_of_pinned_messages = pinnedMessages.length;

			const speechText = ri('PINNED_MESSAGES.SUCCESS', { no_of_pinned_messages, channelname: resolvedChannelDetails[0].name, username: pinnedMessages[no_of_pinned_messages - 1][0], message: pinnedMessages[no_of_pinned_messages - 1][1] });
			const repromptText = ri('GENERIC_REPROMPT');


			if (!supportsAPL(handlerInput)) {
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
			}


			let apltext = '';

			// message[0] represents the author of the message and message[1] represents the message content
			for (const message of pinnedMessages) {
				apltext += `<b>${ message[0] }:</b>${ message[1] }<br><br>`;
			}

			const data = {
				title: `Pinned Messages in ${ resolvedChannelDetails[0].name }: ${ pinnedMessages.length }`,
				message: apltext,
			};

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.addDirective(titleMessageBoxTemplate(data))
				.getResponse();

		} catch (error) {
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
	ReadPinnedMessagesIntentHandler,
};
