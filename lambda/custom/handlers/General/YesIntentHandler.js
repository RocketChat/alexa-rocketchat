const { ri } = require('@jargon/alexa-skill-sdk');

const YesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
	},
	handle(handlerInput) {

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		return handlerInput.jrb
			.speak(ri('POST_MESSAGE.CONFIRM_MORE'))
			.reprompt(ri('POST_MESSAGE.CONFIRM_MORE_REPROMPT'))
			.addElicitSlotDirective('longmessage', {
				name: 'PostLongMessageIntent',
				confirmationStatus: 'NONE',
				slots: {
					channelname: {
						name: 'channelname',
						value: sessionAttributes.channelName,
						confirmationStatus: 'NONE',
					},
					longmessage: {
						name: 'longmessage',
						confirmationStatus: 'NONE',
					},
				},
			})
			.getResponse();
	},
};

module.exports = {
	YesIntentHandler,
};
