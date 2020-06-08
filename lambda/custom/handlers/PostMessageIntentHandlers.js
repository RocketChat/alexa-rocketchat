const { ri } = require('@jargon/alexa-skill-sdk');
const { getStaticAndDynamicSlotValuesFromSlot, replaceWhitespacesFunc, login, postMessage } = require('../helperFunctions');
const { supportsAPL } = require('../utils');
const titleMessageTemplate = require('../APL/templates/titleMessageTemplate');

const StartedPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
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

const DeniedPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('POST_MESSAGE.DENIED');

		return handlerInput.jrb
			.speak(speechText)
			.addDelegateDirective({
				name: 'PostMessageIntent',
				confirmationStatus: 'NONE',
				slots: {
					messagechannel: {
						name: 'messagechannel',
						confirmationStatus: 'NONE',
					},
					messagepost: {
						name: 'messagepost',
						confirmationStatus: 'NONE',
					},
				},
			})
			.getResponse();
	},
};

const PostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
              && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			const channelNameData = getStaticAndDynamicSlotValuesFromSlot(handlerInput.requestEnvelope.request.intent.slots.messagechannel);
			const channelName = replaceWhitespacesFunc(channelNameData);

			const headers = await login(accessToken);
			const speechText = await postMessage(channelName, message, headers);
			const repromptText = ri('GENERIC_REPROMPT');
			const data = {
				title: `Message sent to #${ channelName }`,
				message,
			};

			if (supportsAPL(handlerInput)) {

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

		} catch (error) {
			console.error(error);
		}
	},
};


module.exports = {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler,
};
