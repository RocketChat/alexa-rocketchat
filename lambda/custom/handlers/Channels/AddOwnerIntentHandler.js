const { ri } = require('@jargon/alexa-skill-sdk');
const { replaceWhitespacesDots, replaceWhitespacesFunc, login, getRoomId, getUserId, addOwner } = require('../../helperFunctions');

const AddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent';
	},
	async handle(handlerInput) {
		try {

			const userNameData = handlerInput.requestEnvelope.request.intent.slots.ownerusername.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.ownerchannelname.value;
			const userName = replaceWhitespacesDots(userNameData);
			const channelName = replaceWhitespacesFunc(channelNameData);

			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await login(accessToken);
			const userid = await getUserId(userName, headers);
			const roomid = await getRoomId(channelName, headers);
			const speechText = await addOwner(userName, channelName, userid, roomid, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('ADD_OWNER.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	AddOwnerIntentHandler,
};
