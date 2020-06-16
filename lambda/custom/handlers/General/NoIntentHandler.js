const { ri } = require('@jargon/alexa-skill-sdk');
const { login, postMessage } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageTemplate = require('../../APL/templates/titleMessageTemplate');


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
				delete sessionAttributes.postLongMessageIntentOnProgress;
				delete sessionAttributes.channelConfirm;
				const {
					accessToken,
				} = handlerInput.requestEnvelope.context.System.user;



				const { channelName } = sessionAttributes;
				const { message } = sessionAttributes;

				delete sessionAttributes.channelName;
				delete sessionAttributes.message;

				const headers = await login(accessToken);
				const speechText = await postMessage(channelName, message, headers);
				const repromptText = ri('GENERIC_REPROMPT');


				if (supportsAPL(handlerInput)) {
					const data = {
						title: `Message sent to #${ channelName }`,
						message,
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();

				} else {
					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
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
