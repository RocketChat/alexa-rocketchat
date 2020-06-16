const { ri } = require('@jargon/alexa-skill-sdk');
const { login, createChannel, replaceWhitespacesFunc } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const { createChannelLayout } = require('../../APL/layouts');

const StartedCreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressCreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
        handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const DeniedCreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('CREATE_CHANNEL.DENIED');

		return handlerInput.jrb
			.speak(speechText)
			.addDelegateDirective({
				name: 'CreateChannelIntent',
				confirmationStatus: 'NONE',
				slots: {
					channelname: {
						name: 'channelname',
						confirmationStatus: 'NONE',
					},
				},
			})
			.getResponse();
	},
};

const CreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
              && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
			const channelName = replaceWhitespacesFunc(channelNameData);

			const headers = await login(accessToken);
			const speechText = await createChannel(channelName, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						version: '1.0',
						document: createChannelLayout,
						datasources: {

							CreateChannelPageData: {
								type: 'object',
								objectId: 'rcCreateChannel',
								backgroundImage: {
									contentDescription: null,
									smallSourceUrl: null,
									largeSourceUrl: null,
									sources: [
										{
											url: 'https://user-images.githubusercontent.com/41849970/60651516-fcb23880-9e63-11e9-8efb-1e590a41489e.png',
											size: 'small',
											widthPixels: 0,
											heightPixels: 0,
										},
										{
											url: 'https://user-images.githubusercontent.com/41849970/60651516-fcb23880-9e63-11e9-8efb-1e590a41489e.png',
											size: 'large',
											widthPixels: 0,
											heightPixels: 0,
										},
									],
								},
								textContent: {
									placeholder: {
										type: 'PlainText',
										text: 'Channel',
									},
									channelname: {
										type: 'PlainText',
										text: `#${ speechText.params.channelName }`,
									},
									successful: {
										type: 'PlainText',
										text: 'created successfully.',
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
					.withSimpleCard(ri('CREATE_CHANNEL.CARD_TITLE'), speechText)
					.getResponse();

			}

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	StartedCreateChannelIntentHandler,
	DeniedCreateChannelIntentHandler,
	InProgressCreateChannelIntentHandler,
	CreateChannelIntentHandler,
};
