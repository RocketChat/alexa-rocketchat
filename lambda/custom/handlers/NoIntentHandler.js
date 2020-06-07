const { ri } = require('@jargon/alexa-skill-sdk');
const { login, postMessage } = require('../helperFunctions');
const { postMessageLayout } = require('../APL/layouts');
const { supportsAPL } = require('../utils');

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

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							version: '1.0',
							document: postMessageLayout,
							datasources: {

								PostMessageData: {
									type: 'object',
									objectId: 'rcPostMessage',
									backgroundImage: {
										contentDescription: null,
										smallSourceUrl: null,
										largeSourceUrl: null,
										sources: [
											{
												url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
												size: 'small',
												widthPixels: 0,
												heightPixels: 0,
											},
											{
												url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
												size: 'large',
												widthPixels: 0,
												heightPixels: 0,
											},
										],
									},
									textContent: {
										channelname: {
											type: 'PlainText',
											text: `#${ channelName }`,
										},
										message: {
											type: 'PlainText',
											text: message,
										},
									},
									logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
								},

							},
						})
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
