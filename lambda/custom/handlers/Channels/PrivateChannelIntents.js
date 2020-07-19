const { ri } = require('@jargon/alexa-skill-sdk');
const helperFunctions = require('../../helperFunctions');

const DeleteGroupIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'DeleteGroupIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.deletegroupname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.deleteGroup(channelName, headers);
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('DELETE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostGroupEmojiMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostGroupEmojiMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const messageData = handlerInput.requestEnvelope.request.intent.slots.groupemojimessage.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupmessageemojichannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);
			const emojiData = handlerInput.requestEnvelope.request.intent.slots.groupmessageemojiname.value;
			const emoji = helperFunctions.emojiTranslateFunc(emojiData);
			const message = messageData + emoji;

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.postGroupMessage(roomid, message, headers);
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

const GroupLastMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'GroupLastMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.grouplastmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.groupLastMessage(channelName, roomid, headers);
			const repromptText = ri('GENERIC_REPROMPT');


			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('GET_LAST_MESSAGE_FROM_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const GetGroupUnreadMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadGroupUnreadsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupunreadschannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const unreadCount = await helperFunctions.getGroupUnreadCounter(roomid, headers);
			const speechText = await helperFunctions.groupUnreadMessages(channelName, roomid, unreadCount, headers);
			const repromptText = ri('GENERIC_REPROMPT');


			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	DeleteGroupIntentHandler,
	PostGroupEmojiMessageIntentHandler,
	GroupLastMessageIntentHandler,
	GetGroupUnreadMessagesIntentHandler,
};
