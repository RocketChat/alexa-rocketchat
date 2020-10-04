const { ri } = require('@jargon/alexa-skill-sdk');
const { login, postMessage } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');

const YesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		if (sessionAttributes.postLongMessageIntentOnProgress) {

			if (sessionAttributes.postLongMessageConfirmation) {

				delete sessionAttributes.postLongMessageConfirmation;
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
						title: handlerInput.translate('POST_MESSAGE.APL_SUCCESS', { channelName }),
						message,
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageBoxTemplate(data))
						.getResponse();

				} else {
					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
						.getResponse();
				}
			}

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
		} else {
			const speechText = ri('YES_PROMPT');
			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.getResponse();
		}


	},
};

module.exports = {
	YesIntentHandler,
};
