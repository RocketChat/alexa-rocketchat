const Alexa = require('ask-sdk-core');
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, removeLeader } = require('../../helperFunctions');
const { resolveChannel, resolveUserWithRole } = require('../../utils');

const StartedRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent' &&
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
			console.log('resolve user ran');
			return resolveUserWithRole(handlerInput, 'leader');
		} else if (intentSlots.channelname.confirmationStatus === 'NONE' && intentSlots.channelname.value) {
			console.log('resolve channel ran');
			return resolveChannel(handlerInput);
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const RemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		const headers = await login(accessToken);

		const speakOutput = await removeLeader(sessionAttributes.channel.id, sessionAttributes.user._id, sessionAttributes.channel.name, sessionAttributes.user.username, sessionAttributes.channel.type, headers);
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const DeniedRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {

		const speakOutput = ri('ROOM_ROLES.ADD_LEADER_DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const InProgressRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const { intent } = handlerInput.requestEnvelope.request;
		const intentSlots = intent.slots;

		if (intentSlots.username.confirmationStatus === 'NONE' && intentSlots.username.value) {
			return resolveUserWithRole(handlerInput, 'leader');
		} else if (intentSlots.channelname.confirmationStatus === 'NONE' && intentSlots.channelname.value) {
			return resolveChannel(handlerInput);
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(intent)
			.getResponse();
	},
};

module.exports = {
	StartedRemoveLeaderIntentHandler,
	RemoveLeaderIntentHandler,
	DeniedRemoveLeaderIntentHandler,
	InProgressRemoveLeaderIntentHandler,
};
