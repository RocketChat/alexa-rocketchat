const { ri } = require('@jargon/alexa-skill-sdk');
const { login, createPersonalAccessToken, getUserName, customLog } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleHintTemplate = require('../../APL/templates/titleHintTemplate');
const errorMessageTemplate = require('../../APL/templates/errorMessageTemplate');


const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput) {
		try {
			const { attributesManager } = handlerInput;
			const attributes = await attributesManager.getPersistentAttributes() || {};

			if (handlerInput.requestEnvelope.context.System.user.accessToken === undefined) {

				const speechText = ri('WELCOME.ERROR');

				if (supportsAPL(handlerInput)) {
					const data = {
						errorTitle: handlerInput.translate('WELCOME.AUTH_ERROR_TITLE'),
						errorMessage: handlerInput.translate('WELCOME.ERROR'),
					};

					return handlerInput.jrb
						.speak(speechText)
						.addDirective(errorMessageTemplate(data))
						.withLinkAccountCard()
						.withShouldEndSession(true)
						.getResponse();

				} else {

					return handlerInput.jrb
						.speak(speechText)
						.withLinkAccountCard()
						.withShouldEndSession(true)
						.getResponse();

				}
			}

			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			let speechText = '';

			if (attributes.hasOwnProperty('userId')) {
				speechText = ri('WELCOME.SUCCESS_RETURN_USER');
			} else {
				attributes.userId = handlerInput.requestEnvelope.context.System.user.userId;
				speechText = ri('WELCOME.SUCCESS');
			}

			if (attributes.hasOwnProperty('optForNotifications') && !attributes.hasOwnProperty('personalAccessToken')) {
				if (attributes.optForNotifications === true) {
					const dataResponse = await createPersonalAccessToken(headers);
					if (dataResponse.length !== 0) {
						attributes.profileId = headers['X-User-Id'];
						// personal access tokens should be encrypted before storing
						// attributes.personalAccessToken = dataResponse;
						attributes.notificationsSettings = 'userMentions';
						attributes.apiRegion = 'userMentions';
						attributes.userName = await getUserName(headers);
					}
				}
			}


			handlerInput.attributesManager.setPersistentAttributes(attributes);
			await handlerInput.attributesManager.savePersistentAttributes();

			if (supportsAPL(handlerInput)) {
				const data = {
					title: handlerInput.translate('WELCOME.CARD_TITLE'),
					hint: handlerInput.translate('WELCOME.HINT'),
				};

				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addDirective(titleHintTemplate(data))
					.getResponse();

			} else {

				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.withSimpleCard(ri('WELCOME.CARD_TITLE'), speechText)
					.getResponse();

			}

		} catch (err) {
			console.log(err);
			customLog({ err: err.toString() });

			const speechText = ri('ERRORS');

			return handlerInput.jrb
				.speak(speechText)
				.withShouldEndSession(true)
				.getResponse();
		}
	},
};

module.exports = {
	LaunchRequestHandler,
};
