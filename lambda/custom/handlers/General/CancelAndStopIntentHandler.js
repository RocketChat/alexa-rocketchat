const { ri } = require('@jargon/alexa-skill-sdk');

const CancelAndStopIntentHandler = {
	async canHandle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (!attributes.hasOwnProperty('inPlaybackSession') || attributes.inPlaybackSession === false) {
			return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
				handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
					handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
		}
	},
	handle(handlerInput) {
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
	},
};

module.exports = {
	CancelAndStopIntentHandler,
};

