const { ri } = require('@jargon/alexa-skill-sdk');

const HelpIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speechText = ri('HELP.MESSAGE');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard(ri('HELP.CARD_TITLE'), speechText)
			.getResponse();
	},
};

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
			.withSimplesuppoCard(ri('GOODBYE.CARD_TITLE'), speechText)
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR',
			})
			.getResponse();
	},
};

module.exports = {
	CancelAndStopIntentHandler,
	HelpIntentHandler,
};