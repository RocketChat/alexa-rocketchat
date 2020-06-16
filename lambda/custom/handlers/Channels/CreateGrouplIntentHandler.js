const { ri } = require('@jargon/alexa-skill-sdk');
const { replaceWhitespacesFunc, login, createGroup } = require('../../helperFunctions');

const CreateGrouplIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'CreateGroupIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupname.value;
			const channelName = replaceWhitespacesFunc(channelNameData);

			const headers = await login(accessToken);
			const speechText = await createGroup(channelName, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('CREATE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	CreateGrouplIntentHandler,
};
