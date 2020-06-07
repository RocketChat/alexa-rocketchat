const { ri } = require('@jargon/alexa-skill-sdk');
const { login, replaceWhitespacesFunc, emojiTranslateFunc, postMessage } = require('../helperFunctions');

const PostEmojiMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostEmojiMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;
			const channelName = replaceWhitespacesFunc(channelNameData);
			const emojiData = handlerInput.requestEnvelope.request.intent.slots.emoji.value;
			const emoji = emojiTranslateFunc(emojiData);
			const messageData = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			const message = messageData + emoji;

			const headers = await login(accessToken);
			const speechText = await postMessage(channelName, message, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	PostEmojiMessageIntentHandler,
};
