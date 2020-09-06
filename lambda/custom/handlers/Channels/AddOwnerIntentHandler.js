const Alexa = require('ask-sdk-core');
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, addOwner } = require('../../helperFunctions');
const { resolveChannel, resolveUser } = require('../../utils');

const StartedAddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const intentSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		// clear the session attributes that this intent will make use of
		delete sessionAttributes.user;
		delete sessionAttributes.channel;
		delete sessionAttributes.similarusers;
		delete sessionAttributes.similarChannels;

		// this will take care of the cases when both the slots will be filled during intent invocation
		// eg: make username as owner of channel channelname
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

const AddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddOwnerIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		const headers = await login(accessToken);

		const speakOutput = await addOwner(sessionAttributes.channel.id, sessionAttributes.user.id, sessionAttributes.channel.name, sessionAttributes.user.name, sessionAttributes.channel.type, headers);
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const DeniedAddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent'
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

const InProgressAddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent'
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
	StartedAddOwnerIntentHandler,
	AddOwnerIntentHandler,
	DeniedAddOwnerIntentHandler,
	InProgressAddOwnerIntentHandler,
};
