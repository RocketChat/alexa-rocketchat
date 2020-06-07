const { ri } = require('@jargon/alexa-skill-sdk');
const { customLog } = require('../helperFunctions');

const ProactiveEventHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'AlexaSkillEvent.ProactiveSubscriptionChanged';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (handlerInput.requestEnvelope.request.hasOwnProperty('body')) {
			if (attributes.hasOwnProperty('optForNotifications')) {
				attributes.optForNotifications = !attributes.optForNotifications;
			} else {
				attributes.optForNotifications = true;
			}
		} else {
			attributes.optForNotifications = false;
		}

		handlerInput.attributesManager.setPersistentAttributes(attributes);
		await handlerInput.attributesManager.savePersistentAttributes();
	},
};


const AudioPlayerEventHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
	},
	async handle(handlerInput) {

		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};
		attributes.inPlaybackSession = true;

		const audioPlayerEventName = handlerInput.requestEnvelope.request.type.split('.')[1];

		switch (audioPlayerEventName) {
			case 'PlaybackStarted':
				attributes.inPlaybackSession = true;
				break;
			case 'PlaybackFinished':
				attributes.inPlaybackSession = false;
				break;
			case 'PlaybackStopped':
				attributes.inPlaybackSession = true;
				break;
			case 'PlaybackNearlyFinished':
				attributes.inPlaybackSession = true;
				break;
			case 'PlaybackFailed':
				attributes.inPlaybackSession = false;
				console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
				return;
			default:
				throw new Error('Should never reach here!');
		}

		await handlerInput.attributesManager.savePersistentAttributes();

		return handlerInput.responseBuilder.getResponse();
	},
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${ handlerInput.requestEnvelope.request.reason }`);
		customLog({ session_ended_reason: handlerInput.requestEnvelope.request.reason });

		return handlerInput.responseBuilder
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR',
			})
			.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	async handle(handlerInput, error) {
		console.log(`Error handled: ${ error.message }`);
		customLog({ errorMessage: error.message });
		const speechText = ri('ERRORS');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	},
};

module.exports = {
	ProactiveEventHandler,
	AudioPlayerEventHandler,
	SessionEndedRequestHandler,
	ErrorHandler,
};
