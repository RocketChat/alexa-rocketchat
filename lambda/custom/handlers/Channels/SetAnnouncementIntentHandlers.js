const { ri } = require('@jargon/alexa-skill-sdk');
const { login, setAnnouncement } = require('../../helperFunctions');
const { supportsAPL, resolveChannel } = require('../../utils');
const titleMessageTemplate = require('../../APL/templates/titleMessageBoxTemplate');


const StartedSetAnnouncementIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'SetAnnouncementIntent' &&
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

const InProgressSetAnnouncementIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'SetAnnouncementIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		return resolveChannel(handlerInput, 'channelname', 'channelChoice');
	},
};

const DeniedSetAnnouncementIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'SetAnnouncementIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('CHANNEL_DETAILS.SET_ANNOUNCEMENT_DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const SetAnnouncementIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'SetAnnouncementIntent'
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
			const announcement = handlerInput.requestEnvelope.request.intent.slots.announcement.value;

			const headers = await login(accessToken);
			const speechText = await setAnnouncement(sessionAttributes.channel, announcement, headers);

			delete sessionAttributes.similarChannels;
			delete sessionAttributes.channel;

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				// the helper function sets and returns a "success" parameter to the speechText
				// if the operation was successful then display a sucess message and announcement in APL
				if (speechText.params && speechText.params.success) {
					const data = {
						title: handlerInput.translate('CHANNEL_DETAILS.SET_ANNOUNCEMENT_SUCCESS', { roomname: channelName }),
						message: announcement,
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();

				} else {
					// if operation failed, display a failed message in APL
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
	StartedSetAnnouncementIntentHandler,
	InProgressSetAnnouncementIntentHandler,
	DeniedSetAnnouncementIntentHandler,
	SetAnnouncementIntentHandler,
};
