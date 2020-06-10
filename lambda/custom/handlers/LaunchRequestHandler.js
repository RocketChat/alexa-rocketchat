const { ri } = require('@jargon/alexa-skill-sdk');
const { login, createPersonalAccessToken, getUserName, channelList } = require('../helperFunctions');
const { authorisationErrorLayout } = require('../APL/layouts');
const { supportsAPL } = require('../utils');
const homePageTemplate = require('../APL/templates/homePageTemplate');


const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (handlerInput.requestEnvelope.context.System.user.accessToken === undefined) {

			const speechText = ri('WELCOME.ERROR');

			if (supportsAPL(handlerInput)) {

				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						version: '1.0',
						document: authorisationErrorLayout,
						datasources: {
							AuthorisationErrorPageData: {
								type: 'object',
								objectId: 'rcAuthorisation',
								backgroundImage: {
									contentDescription: null,
									smallSourceUrl: null,
									largeSourceUrl: null,
									sources: [
										{
											url: 'https://user-images.githubusercontent.com/41849970/60644955-126c3180-9e55-11e9-9147-7820655f3c0b.png',
											size: 'small',
											widthPixels: 0,
											heightPixels: 0,
										},
										{
											url: 'https://user-images.githubusercontent.com/41849970/60644955-126c3180-9e55-11e9-9147-7820655f3c0b.png',
											size: 'large',
											widthPixels: 0,
											heightPixels: 0,
										},
									],
								},
								textContent: {
									primaryText: {
										type: 'PlainText',
										text: 'AUTHORISED PERSONNEL ONLY',
									},
									secondaryText: {
										type: 'PlainText',
										text: 'To start using this skill, please use the companion app to authenticate.',
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
					.reprompt(speechText)
					.withSimpleCard(ri('WELCOME.CARD_TITLE'), speechText)
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
					attributes.personalAccessToken = dataResponse;
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
				title: 'Welcome to Rocket.Chat',
				hint: 'Try, "Alexa, Send a message"',
			};

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addDirective(homePageTemplate(data))
				.addDirective({
					type: 'Dialog.UpdateDynamicEntities',
					updateBehavior: 'REPLACE',
					types: [
						{
							name: 'channelnames',
							values: await channelList(headers),
						},
					],
				})
				.getResponse();

		} else {

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('WELCOME.CARD_TITLE'), speechText)
				.addDirective({
					type: 'Dialog.UpdateDynamicEntities',
					updateBehavior: 'REPLACE',
					types: [
						{
							name: 'channelnames',
							values: await channelList(headers),
						},
					],
				})
				.getResponse();

		}

	},
};

module.exports = {
	LaunchRequestHandler,
};
