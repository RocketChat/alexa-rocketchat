const { ri } = require('@jargon/alexa-skill-sdk');
const { supportsDisplay } = require('../utils');


const StartPlaybackHandler = {
	async canHandle(handlerInput) {

		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (attributes.hasOwnProperty('inPlaybackSession') && attributes.inPlaybackSession === true) {
			const { request } = handlerInput.requestEnvelope;
			if (request.type === 'PlaybackController.PlayCommandIssued') {
				return true;
			}
			if (request.type === 'IntentRequest') {
				return request.intent.name === 'AMAZON.ResumeIntent';
			}
		}
		return false;

	},
	async handle(handlerInput) {

		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		const playBehavior = 'REPLACE_ALL';
		const token = fileurl.split('/').slice(-2)[0];
		const offsetInMilliseconds = 0;

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
				.speak('You have received an audio message!')
				.addAudioPlayerPlayDirective(playBehavior, attributes.playBackURL, token, offsetInMilliseconds, null, metadata)
				.getResponse();

		} else {

			return handlerInput.jrb
				.speak('You have received an audio message!')
				.addAudioPlayerPlayDirective(playBehavior, attributes.playBackURL, token, offsetInMilliseconds, null, null)
				.getResponse();
		}
	},
};

const AudioControlPlaybackHandler = {
	async canHandle(handlerInput) {
		const { request } = handlerInput.requestEnvelope;

		return request.type === 'PlaybackController.NextCommandIssued' || request.type === 'PlaybackController.PreviousCommandIssued' ||
(request.type === 'IntentRequest' && (request.intent.name === 'AMAZON.NextIntent' || request.intent.name === 'AMAZON.PreviousIntent' || request.intent.name === 'AMAZON.LoopOnIntent' || request.intent.name === 'AMAZON.LoopOffIntent' || request.intent.name === 'AMAZON.ShuffleOnIntent' || request.intent.name === 'AMAZON.ShuffleOffIntent' || request.intent.name === 'AMAZON.StartOverIntent' || request.intent.name === 'AMAZON.ResumeIntent'));
	},
	handle(handlerInput) {
		const speechText = ri('AUDIO_NO_SUPPORT');
		return handlerInput.jrb
			.speak(speechText)
			.getResponse();
	},
};

const PausePlaybackHandler = {
	async canHandle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (attributes.hasOwnProperty('inPlaybackSession') && attributes.inPlaybackSession === true) {
			const { request } = handlerInput.requestEnvelope;

			return request.type === 'IntentRequest' &&
(request.intent.name === 'AMAZON.StopIntent' ||
request.intent.name === 'AMAZON.CancelIntent' ||
request.intent.name === 'AMAZON.PauseIntent');
		}
		return false;
	},
	async handle(handlerInput) {

		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		delete attributes.inPlaybackSession;
		delete attributes.playBackURL;
		await handlerInput.attributesManager.savePersistentAttributes();

		const speechText = ri('GOODBYE.MESSAGE');

		return handlerInput.jrb
			.speak(speechText)
			.withSimpleCard(ri('GOODBYE.CARD_TITLE'), speechText)
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR',
			})
			.addAudioPlayerStopDirective()
			.getResponse();
	},
};

module.exports = {
	StartPlaybackHandler,
	AudioControlPlaybackHandler,
	PausePlaybackHandler,
};
