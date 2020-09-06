const { ri } = require('@jargon/alexa-skill-sdk');
const { login, unarchiveChannel } = require('../../helperFunctions');
const { supportsAPL, resolveChannel } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');

const StartedUnarchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'UnarchiveChannelIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		delete sessionAttributes.similarChannels;
		delete sessionAttributes.channel;

		return resolveChannel(handlerInput, 'channelname', 'choice');
	},
};

const InProgressUnarchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'UnarchiveChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		return resolveChannel(handlerInput, 'channelname', 'choice');
	},
};

const DeniedUnarchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'UnarchiveChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('ARCHIVE_CHANNEL.DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const UnarchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'UnarchiveChannelIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
              && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const { attributesManager } = handlerInput;
			const sessionAttributes = attributesManager.getSessionAttributes() || {};

			const headers = await login(accessToken);
			const speechText = await unarchiveChannel(sessionAttributes.channel.id, sessionAttributes.channel.name, sessionAttributes.channel.type, headers);

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				const data = {
					title: '',
					message: handlerInput.translate(speechText.key, speechText.params),
				};

				delete sessionAttributes.similarChannels;
				delete sessionAttributes.channel;

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective(titleMessageBoxTemplate(data))
					.getResponse();

			} else {

				delete sessionAttributes.similarChannels;
				delete sessionAttributes.channel;

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();

			}

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	StartedUnarchiveChannelIntentHandler,
	InProgressUnarchiveChannelIntentHandler,
	DeniedUnarchiveChannelIntentHandler,
	UnarchiveChannelIntentHandler,
};
