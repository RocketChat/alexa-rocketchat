const Alexa = require('ask-sdk-core');
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, addModerator } = require('../../helperFunctions');
const { resolveChannel, resolveUser } = require('../../utils');

const StartedAddModeratorIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'AddModeratorIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const intentSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		delete sessionAttributes.user;
		delete sessionAttributes.channel;
		delete sessionAttributes.similarusers;
		delete sessionAttributes.similarChannels;

		if (intentSlots.username.confirmationStatus === 'NONE' && intentSlots.username.value) {
			return resolveUser(handlerInput, 'username', 'choice');
		} else if (intentSlots.channelname.confirmationStatus === 'NONE' && intentSlots.channelname.value) {
			return resolveChannel(handlerInput, 'channelname', 'choice');
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const AddModeratorIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddModeratorIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		const headers = await login(accessToken);

		const speakOutput = await addModerator(sessionAttributes.channel.id, sessionAttributes.user.id, sessionAttributes.channel.name, sessionAttributes.user.name, sessionAttributes.channel.type, headers);
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const DeniedAddModeratorIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddModeratorIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {

		const speakOutput = ri('ROOM_ROLES.DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const InProgressAddModeratorIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddModeratorIntent'
            && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const { intent } = handlerInput.requestEnvelope.request;
		const intentSlots = intent.slots;

		if (intentSlots.username.confirmationStatus === 'NONE' && intentSlots.username.value) {
			return resolveUser(handlerInput, 'username', 'choice');
		} else if (intentSlots.channelname.confirmationStatus === 'NONE' && intentSlots.channelname.value) {
			return resolveChannel(handlerInput, 'channelname', 'choice');
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(intent)
			.getResponse();
	},
};

module.exports = {
	StartedAddModeratorIntentHandler,
	AddModeratorIntentHandler,
	DeniedAddModeratorIntentHandler,
	InProgressAddModeratorIntentHandler,
};
