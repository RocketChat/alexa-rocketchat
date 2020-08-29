const { ri } = require('@jargon/alexa-skill-sdk');
const { login, setDescription } = require('../../helperFunctions');
const { supportsAPL, resolveChannel } = require('../../utils');
const titleMessageTemplate = require('../../APL/templates/titleMessageBoxTemplate');


const StartedSetDescriptionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'SetDescriptionIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		delete sessionAttributes.similarChannels;
		delete sessionAttributes.channel;

		return resolveChannel(handlerInput, 'channelname', 'channelChoice');
	},
};

const InProgressSetDescriptionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'SetDescriptionIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		return resolveChannel(handlerInput, 'channelname', 'channelChoice');
	},
};

const DeniedSetDescriptionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'SetDescriptionIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('CHANNEL_DETAILS.SET_DESCRIPTION_DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const SetDescriptionIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'SetDescriptionIntent'
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

			const channelName = sessionAttributes.channel.name;
			const description = handlerInput.requestEnvelope.request.intent.slots.description.value;

			const headers = await login(accessToken);
			const speechText = await setDescription(sessionAttributes.channel, description, headers);

			delete sessionAttributes.similarChannels;
			delete sessionAttributes.channel;

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				// the helper function sets and returns a "success" parameter to the speechText
				// if the operation was successful then display a sucess message and announcement in APL
				if (speechText.params && speechText.params.success) {
					const data = {
						title: handlerInput.translate('CHANNEL_DETAILS.SET_DESCRIPTION_SUCCESS', { roomname: channelName }),
						message: description,
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();

				} else {
					const data = {
						title: handlerInput.translate('CHANNEL_DETAILS.ERROR'),
						message: '',
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();
				}

			} else {

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
	StartedSetDescriptionIntentHandler,
	InProgressSetDescriptionIntentHandler,
	DeniedSetDescriptionIntentHandler,
	SetDescriptionIntentHandler,
};
