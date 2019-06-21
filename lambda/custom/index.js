/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const helperFunctions = require('./helperFunctions');
const main = require('./main.json');

// Jargon for Localization
const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri
} = Jargon;

//APL Compaitability Checker Function

function supportsAPL(handlerInput) {
	const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
	return aplInterface != null && aplInterface != undefined;
}

// Alexa Intent Functions

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput) {

		if (handlerInput.requestEnvelope.context.System.user.accessToken === undefined) {

			const speechText = ri('WELCOME_ANONYMOUS_USER.SUCCESS');

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.getResponse();
		}
		const speechText = ri('WELCOME.SUCCESS');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard(ri('WELCOME.CARD_TITLE'), speechText)
			.getResponse();

	},
};

const flashBreifingIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'FlashBriefingIntent';
	},
	async handle(handlerInput) {

		var channelName = "general";

		const speechText = await helperFunctions.flashBriefingMessage(channelName);

		return handlerInput.jrb
			.speak(speechText)
			.withSimpleCard(ri('FLASH_BRIEFING.CARD_TITLE'), speechText)
			.getResponse();

	},
};

const CreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.createChannel(channelName, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('CREATE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const DeleteChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'DeleteChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.channeldelete.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.deleteChannel(channelName, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('DELETE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			let message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.postMessage(channelName, message, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostEmojiMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostEmojiMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);
			const emojiData = handlerInput.requestEnvelope.request.intent.slots.emoji.value;
			const emoji = helperFunctions.emojiTranslateFunc(emojiData);
			const messageData = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			const message = messageData + emoji;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.postMessage(channelName, message, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const GetLastMessageFromChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'GetLastMessageFromChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.getmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const fileurl = await helperFunctions.getLastMessageFileURL(channelName, headers);
			const download = await helperFunctions.getLastMessageFileDowloadURL(fileurl, headers);
			const speechText = await helperFunctions.channelLastMessage(channelName, headers);


			if (supportsAPL(handlerInput)) {

				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						version: '1.0',
						document: main,
						datasources:

						{

							"bodyTemplate6Data": {
								"type": "object",
								"objectId": "bt6Sample",
								"backgroundImage": {
									"sources": [{

											"url": download,
											"size": "small",

										},
										{
											"url": download,
											"size": "large",

										}
									]
								},
								"textContent": {
									"primaryText": {
										"type": "PlainText",
										"text": "This Is An Image Message"
									}
								},
								"logoUrl": "https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png",
								"hintText": "SAMPLE REDIRECTION URL TEST"
							}


						}


					})
					.getResponse();

			} else {
				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.withSimpleCard(ri('GET_LAST_MESSAGE_FROM_CHANNEL.CARD_TITLE'), speechText)
					.getResponse();
			}

		} catch (error) {
			console.error(error);
		}
	},
};

const GetUnreadMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.readunreadschannel.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const unreadCount = await helperFunctions.getUnreadCounter(channelName, headers);
			const speechText = await helperFunctions.channelUnreadMessages(channelName, unreadCount, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const AddAllToChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AddAllToChannelIntent';
	},
	async handle(handlerInput) {
		try {

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.addallchannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.addAll(channelName, roomid, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('ADD_ALL_TO_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const MakeModeratorIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'MakeModeratorIntent';
	},
	async handle(handlerInput) {
		try {

			const userNameData = handlerInput.requestEnvelope.request.intent.slots.moderatorusername.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.moderatorchannelname.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.makeModerator(userName, channelName, userid, roomid, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('MAKE_MODERATOR.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const AddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent';
	},
	async handle(handlerInput) {
		try {

			const userNameData = handlerInput.requestEnvelope.request.intent.slots.ownerusername.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.ownerchannelname.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.addOwner(userName, channelName, userid, roomid, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('ADD_OWNER.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const ArchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ArchiveChannelIntent';
	},
	async handle(handlerInput) {
		try {

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.archivechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.archiveChannel(channelName, roomid, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('ARCHIVE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const CreateGrouplIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'CreateGroupIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.createGroup(channelName, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('CREATE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const DeleteGroupIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'DeleteGroupIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.deletegroupname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.deleteGroup(channelName, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('DELETE_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const MakeGroupModeratorIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'MakeGroupModeratorIntent';
	},
	async handle(handlerInput) {
		try {

			const userNameData = handlerInput.requestEnvelope.request.intent.slots.groupmoderatorusername.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupmoderatorchannelname.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.addGroupModerator(userName, channelName, userid, roomid, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('MAKE_MODERATOR.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const MakeGroupOwnerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'MakeGroupOwnerIntent';
	},
	async handle(handlerInput) {
		try {

			const userNameData = handlerInput.requestEnvelope.request.intent.slots.groupownerusername.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupownerchannelname.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.addGroupOwner(userName, channelName, userid, roomid, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('ADD_OWNER.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostGroupMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostGroupMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			let message = handlerInput.requestEnvelope.request.intent.slots.groupmessage.value;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.postGroupMessage(roomid, message, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
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
				accessToken
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


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
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
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.grouplastmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.groupLastMessage(channelName, roomid, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
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
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupunreadschannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const unreadCount = await helperFunctions.getGroupUnreadCounter(roomid, headers);
			const speechText = await helperFunctions.groupUnreadMessages(channelName, roomid, unreadCount, headers);

			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostDirectMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			let message = handlerInput.requestEnvelope.request.intent.slots.directmessage.value;
			const userNameData = handlerInput.requestEnvelope.request.intent.slots.directmessageusername.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.createDMSession(userName, headers);
			const speechText = await helperFunctions.postDirectMessage(message, roomid, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostEmojiDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostEmojiDirectMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const messageData = handlerInput.requestEnvelope.request.intent.slots.directmessage.value;
			const userNameData = handlerInput.requestEnvelope.request.intent.slots.directmessageusername.value;
			const userName = helperFunctions.replaceWhitespacesDots(userNameData);
			const emojiData = handlerInput.requestEnvelope.request.intent.slots.directmessageemojiname.value;
			const emoji = helperFunctions.emojiTranslateFunc(emojiData);
			const message = messageData + emoji;

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.createDMSession(userName, headers);
			const speechText = await helperFunctions.postDirectMessage(message, roomid, headers);


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const HelpIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speechText = ri('HELP.MESSAGE');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard(ri('HELP.CARD_TITLE'), speechText)
			.getResponse();
	},
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
				handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speechText = ri('GOODBYE.MESSAGE');

		return handlerInput.jrb
			.speak(speechText)
			.withSimpleCard(ri('GOODBYE.CARD_TITLE'), speechText)
			.getResponse();
	},
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${ handlerInput.requestEnvelope.request.reason }`);

		return handlerInput.responseBuilder.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${ error.message }`);
		const speechText = ri('ERRORS');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	},
};

const skillBuilder = new Jargon.JargonSkillBuilder().installOnto(Alexa.SkillBuilders.custom());

exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		flashBreifingIntentHandler,
		CreateChannelIntentHandler,
		DeleteChannelIntentHandler,
		PostMessageIntentHandler,
		PostEmojiMessageIntentHandler,
		GetLastMessageFromChannelIntentHandler,
		AddAllToChannelIntentHandler,
		MakeModeratorIntentHandler,
		AddOwnerIntentHandler,
		ArchiveChannelIntentHandler,
		GetUnreadMessagesIntentHandler,
		CreateGrouplIntentHandler,
		DeleteGroupIntentHandler,
		MakeGroupModeratorIntentHandler,
		MakeGroupOwnerIntentHandler,
		PostGroupMessageIntentHandler,
		PostGroupEmojiMessageIntentHandler,
		GroupLastMessageIntentHandler,
		GetGroupUnreadMessagesIntentHandler,
		PostDirectMessageIntentHandler,
		PostEmojiDirectMessageIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();