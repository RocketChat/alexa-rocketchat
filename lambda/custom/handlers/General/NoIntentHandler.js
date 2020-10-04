const { ri } = require('@jargon/alexa-skill-sdk');

const NoIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
	},
	async handle(handlerInput) {
		try {
			const { attributesManager } = handlerInput;
			const sessionAttributes = attributesManager.getSessionAttributes() || {};

			if (sessionAttributes.postLongMessageIntentOnProgress) {

				if (!sessionAttributes.postLongMessageConfirmation) {
					sessionAttributes.postLongMessageConfirmation = true;
					const speechText = ri('POST_MESSAGE.POST_LONG_MESSAGE_CONFIRMATION', { longmessage: sessionAttributes.message, channelName: sessionAttributes.channelName });
					return handlerInput.jrb
						.speak(speechText)
						.reprompt(speechText)
						.getResponse();
				} else {
					delete sessionAttributes.postLongMessageConfirmation;
					delete sessionAttributes.postLongMessageIntentOnProgress;
					delete sessionAttributes.channelConfirm;
					delete sessionAttributes.channelName;
					delete sessionAttributes.message;

					const speechText = ri('POST_MESSAGE.DENIED');
					const repromptText = ri('GENERIC_REPROMPT');
					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.getResponse();
				}
			} else {
				const speechText = ri('GOODBYE.MESSAGE');

				return handlerInput.jrb
					.speak(speechText)
					.withSimpleCard(ri('GOODBYE.CARD_TITLE'), speechText)
					.addDirective({
						type: 'Dialog.UpdateDynamicEntities',
						updateBehavior: 'CLEAR',
					})
					.withShouldEndSession(true)
					.getResponse();
			}

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	NoIntentHandler,
};
