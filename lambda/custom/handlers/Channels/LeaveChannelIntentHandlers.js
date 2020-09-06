const { ri } = require('@jargon/alexa-skill-sdk');
const { login, leaveChannel } = require('../../helperFunctions');
const { supportsAPL, resolveChannel } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');


const StartedLeaveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'LeaveChannelIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	async handle(handlerInput) {

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		delete sessionAttributes.channel;

		return resolveChannel(handlerInput, 'channelname', 'choice');
	},
};

const InProgressLeaveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'LeaveChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		return resolveChannel(handlerInput, 'channelname', 'choice');
	},
};

const DeniedLeaveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'LeaveChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('LEAVE_CHANNEL.DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const LeaveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'LeaveChannelIntent'
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

			// const channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;

			const headers = await login(accessToken);
			const speechText = await leaveChannel(sessionAttributes.channel.id, sessionAttributes.channel.name, sessionAttributes.channel.type, headers);

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				const data = {
					title: '',
					// this basically prints the speechText that the user hears on screen
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
	StartedLeaveChannelIntentHandler,
	InProgressLeaveChannelIntentHandler,
	DeniedLeaveChannelIntentHandler,
	LeaveChannelIntentHandler,
};
