const { ri } = require('@jargon/alexa-skill-sdk');
const helperFunctions = require('../../helperFunctions');
const layouts = require('../../APL/layouts');
const { supportsAPL, supportsDisplay } = require('../../utils');


const GetLastMessageFromChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'GetLastMessageFromChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.getmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);
			const headers = await helperFunctions.login(accessToken);

			const messageType = await helperFunctions.getLastMessageType(channelName, headers);

			if (messageType.includes('audio')) {

				const { attributesManager } = handlerInput;
				const attributes = await attributesManager.getPersistentAttributes() || {};

				const fileurl = await helperFunctions.getLastMessageFileURL(channelName, headers);
				const download = await helperFunctions.getLastMessageFileDowloadURL(fileurl, headers);
				const speechText = await helperFunctions.channelLastMessage(channelName, headers);

				const playBehavior = 'REPLACE_ALL';
				const token = fileurl.split('/').slice(-2)[0];
				const offsetInMilliseconds = 0;

				attributes.inPlaybackSession = true;
				attributes.playBackURL = download;
				await handlerInput.attributesManager.savePersistentAttributes();

				if (supportsDisplay(handlerInput)) {

					const metadata = {
						title: 'Rocket.Chat',
						subtitle: 'You have received an audio message!',
						art: {
							sources: [
								{
									url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
								},
							],
						},
						backgroundImage: {
							sources: [
								{
									url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
								},
							],
						},
					};

					return handlerInput.jrb
						.speak(speechText)
						.addAudioPlayerPlayDirective(playBehavior, download, token, offsetInMilliseconds, null, metadata)
						.getResponse();

				} else {

					return handlerInput.jrb
						.speak(speechText)
						.addAudioPlayerPlayDirective(playBehavior, download, token, offsetInMilliseconds, null, null)
						.getResponse();
				}
			}

			if (supportsAPL(handlerInput)) {

				if (messageType === 'textmessage') {

					const speechText = await helperFunctions.channelLastMessage(channelName, headers);
					const repromptText = ri('GENERIC_REPROMPT');

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							version: '1.0',
							document: layouts.lastMessageLayout,
							datasources: {

								lastMessageData: {
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
										username: {
											type: 'PlainText',
											text: speechText.params.name,
										},
										message: {
											type: 'PlainText',
											text: speechText.params.message,
										},
									},
									logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
								},
							},
						})
						.getResponse();

				} else if (messageType.includes('image')) {

					const fileurl = await helperFunctions.getLastMessageFileURL(channelName, headers);
					const download = await helperFunctions.getLastMessageFileDowloadURL(fileurl, headers);
					const messageData = await helperFunctions.channelLastMessage(channelName, headers);
					const speechText = `${ messageData.params.name } sent you an image message.`;
					const repromptText = ri('GENERIC_REPROMPT');


					return handlerInput.responseBuilder
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							version: '1.0',
							document: layouts.lastMessageImageLayout,
							datasources: {

								lastMessageData: {
									type: 'object',
									objectId: 'rcLastImageMessage',
									backgroundImage: {
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
									messageContent: {
										image: {
											url: download,
										},
										username: {
											type: 'PlainText',
											text: messageData.params.name,
										},
									},
									logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
								},
							},
						})
						.getResponse();

				} else if (messageType.includes('video')) {

					const fileurl = await helperFunctions.getLastMessageFileURL(channelName, headers);
					const download = await helperFunctions.getLastMessageFileDowloadURL(fileurl, headers);
					const speechText = await helperFunctions.channelLastMessage(channelName, headers);
					const repromptText = ri('GENERIC_REPROMPT');


					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							version: '1.0',
							document: layouts.lastMessageVideoLayout,
							datasources: {

								lastMessageData: {
									type: 'object',
									objectId: 'rcLastVideoMessage',
									backgroundImage: {
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
									messageContent: {
										video: {
											url: download,
										},
										username: {
											type: 'PlainText',
											text: speechText.params.name,
										},
									},
									logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
								},
							},
						})
						.getResponse();

				} else {

					const speechText = 'Sorry. This message contains file types, which cannot be accessed on this device.';
					const repromptText = ri('GENERIC_REPROMPT');

					return handlerInput.responseBuilder
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective({
							type: 'Alexa.Presentation.APL.RenderDocument',
							version: '1.0',
							document: layouts.lastMessageNotSupported,
							datasources: {

								LastMessageNotSupportedData: {
									type: 'object',
									objectId: 'rcnotsupported',
									backgroundImage: {
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
											text: 'It’s a trap!',
										},
										secondaryText: {
											type: 'PlainText',
											text: 'Message contains file types which cannot be accessed on this device.',
										},
									},
									logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
								},
							},
						})
						.getResponse();
				}

			} else if (messageType === 'textmessage') {

				const speechText = await helperFunctions.channelLastMessage(channelName, headers);
				const repromptText = ri('GENERIC_REPROMPT');

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.withSimpleCard(ri('GET_LAST_MESSAGE_FROM_CHANNEL.CARD_TITLE'), speechText)
					.getResponse();

			} else {

				const speechText = 'Sorry. This message contains file types, which cannot be accessed on this device.';
				const repromptText = ri('GENERIC_REPROMPT');

				return handlerInput.responseBuilder
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.withSimpleCard('Its a Trap!', speechText)
					.getResponse();

			}

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	GetLastMessageFromChannelIntentHandler,
};
