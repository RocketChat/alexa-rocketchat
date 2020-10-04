const { ri } = require('@jargon/alexa-skill-sdk');
const { replaceWhitespacesFunc, login, getRoomId, archiveChannel } = require('../../helperFunctions');

const ArchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ArchiveChannelIntent';
	},
	async handle(handlerInput) {
		try {

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.archivechannelname.value;
			const channelName = replaceWhitespacesFunc(channelNameData);

			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const roomid = await getRoomId(channelName, headers);
			const speechText = await archiveChannel(channelName, roomid, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('ARCHIVE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	ArchiveChannelIntentHandler,
};
