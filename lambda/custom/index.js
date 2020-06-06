/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const JSON = require('circular-json');
const helperFunctions = require('./helperFunctions');
const envVariables = require('./config');
const layouts = require('./APL/layouts');

// Jargon for Localization
const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri
} = Jargon;

//Permissions for Notifications
const PERMISSIONS = {
	NOTIFICATION_PERMISSION: 'alexa::devices:all:notifications:write'
};

//APL Compaitability Checker Function

function supportsAPL(handlerInput) {
	const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
	return aplInterface != null && aplInterface != undefined;
}

function supportsDisplay(handlerInput) {
	const hasDisplay =
	  handlerInput.requestEnvelope.context &&
	  handlerInput.requestEnvelope.context.System &&
	  handlerInput.requestEnvelope.context.System.device &&
	  handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
	  handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
	return hasDisplay;
}

// Alexa Intent Functions

const ProactiveEventHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'AlexaSkillEvent.ProactiveSubscriptionChanged'
	},
	async handle(handlerInput) {
		const attributesManager = handlerInput.attributesManager;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (handlerInput.requestEnvelope.request.hasOwnProperty("body")) {
			if (attributes.hasOwnProperty("optForNotifications")) {
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
}




const ChangeNotificationSettingsIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ChangeNotificationSettingsIntent';
	},
	async handle(handlerInput) {
		const attributesManager = handlerInput.attributesManager;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		const notificationsFor = helperFunctions.slotValue(handlerInput.requestEnvelope.request.intent.slots.notificationsFor);
		let speechText = '';
		let repromptText = ri('GENERIC_REPROMPT');

		if (attributes.hasOwnProperty("optForNotifications") && attributes.hasOwnProperty("notificationsSettings")) {
			if (attributes.optForNotifications == true) {
				if (attributes.notificationsSettings == notificationsFor) {
					if (notificationsFor === "userMentions") {
						speechText = ri('NOTIFICATION_SETTINGS.ERROR_ALREADY_USERMENTIONS');
					} else {
						speechText = ri('NOTIFICATION_SETTINGS.ERROR_ALREADY_UNREADS');
					}
				} else {
					attributes.notificationsSettings = notificationsFor;
					if (notificationsFor === "userMentions") {
						speechText = ri('NOTIFICATION_SETTINGS.SUCCESS_USERMENTIONS');
					} else {
						speechText = ri('NOTIFICATION_SETTINGS.SUCCESS_UNREADS');
					}
					handlerInput.attributesManager.setPersistentAttributes(attributes);
					await handlerInput.attributesManager.savePersistentAttributes();
				}
			} else {
				speechText = ri('NOTIFICATION_SETTINGS.ERROR_TURNED_OFF');
				return handlerInput.jrb
					.speak(speechText)
					.withAskForPermissionsConsentCard([PERMISSIONS.NOTIFICATION_PERMISSION])
					.getResponse();
			}
		} else {
			speechText = ri('NOTIFICATION_SETTINGS.ERROR');
			return handlerInput.jrb
				.speak(speechText)
				.withAskForPermissionsConsentCard([PERMISSIONS.NOTIFICATION_PERMISSION])
				.getResponse();
		}
		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.withSimpleCard(ri('NOTIFICATION_SETTINGS.CARD_TITLE'), speechText)
			.getResponse();
	},
};

const YesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
	},
	handle(handlerInput) {
		
		const attributesManager = handlerInput.attributesManager;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		return handlerInput.jrb
		  .speak(ri('POST_MESSAGE.CONFIRM_MORE'))
		  .reprompt(ri('POST_MESSAGE.CONFIRM_MORE_REPROMPT'))
		  .addElicitSlotDirective("longmessage", {
			name: 'PostLongMessageIntent',
			confirmationStatus: 'NONE',
			slots: {
				"channelname": {
					"name": "channelname",
					"value": sessionAttributes.channelName,
					"confirmationStatus": "NONE"
				},
				"longmessage": {
					"name": "longmessage",
					"confirmationStatus": "NONE"
				}
			}
		  })
		  .getResponse();
	},
};


const NoIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
	},
	async handle(handlerInput) {
		try {
			const attributesManager = handlerInput.attributesManager;
			const sessionAttributes = attributesManager.getSessionAttributes() || {};

			if(sessionAttributes.postLongMessageIntentOnProgress){
				delete sessionAttributes.postLongMessageIntentOnProgress
				delete sessionAttributes.channelConfirm
				const {
					accessToken
				} = handlerInput.requestEnvelope.context.System.user;



				let channelName = sessionAttributes.channelName;
				let message = sessionAttributes.message;

				delete sessionAttributes.channelName;
				delete sessionAttributes.message;

				const headers = await helperFunctions.login(accessToken);
				const speechText = await helperFunctions.postMessage(channelName, message, headers);
				let repromptText = ri('GENERIC_REPROMPT');


				if (supportsAPL(handlerInput)) {

					return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective({
						type: 'Alexa.Presentation.APL.RenderDocument',
						version: '1.0',
						document: layouts.postMessageLayout,
						datasources: {

							"PostMessageData": {
								"type": "object",
								"objectId": "rcPostMessage",
								"backgroundImage": {
									"contentDescription": null,
									"smallSourceUrl": null,
									"largeSourceUrl": null,
									"sources": [
										{
											"url": "https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png",
											"size": "small",
											"widthPixels": 0,
											"heightPixels": 0
										},
										{
											"url": "https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png",
											"size": "large",
											"widthPixels": 0,
											"heightPixels": 0
										}
									]
								},
								"textContent": {
									"channelname": {
										"type": "PlainText",
										"text": `#${channelName}`
									},
									"message": {
										"type": "PlainText",
										"text": message
									}
								},
								"logoUrl": "https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png"
							}

						}
					})
					.getResponse();

				} else {
					return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
					.getResponse();
				}
			} else {
				const speechText = ri('GOODBYE.MESSAGE');

				return handlerInput.jrb
					.speak(speechText)
					.withSimpleCard(ri('GOODBYE.CARD_TITLE'), speechText)
					.addDirective({
						type: 'Dialog.UpdateDynamicEntities',
						updateBehavior: 'CLEAR'
					})
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
			let repromptText = ri('GENERIC_REPROMPT');

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
			let repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
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
			let repromptText = ri('GENERIC_REPROMPT');


			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
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
			let repromptText = ri('GENERIC_REPROMPT');

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
			let repromptText = ri('GENERIC_REPROMPT');

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
			let repromptText = ri('GENERIC_REPROMPT');

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
			let repromptText = ri('GENERIC_REPROMPT');

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
			let repromptText = ri('GENERIC_REPROMPT');


			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
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
			let repromptText = ri('GENERIC_REPROMPT');


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
			let repromptText = ri('GENERIC_REPROMPT');


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
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;

			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.grouplastmessagechannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const speechText = await helperFunctions.groupLastMessage(channelName, roomid, headers);
			let repromptText = ri('GENERIC_REPROMPT');


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
				accessToken
			} = handlerInput.requestEnvelope.context.System.user;
			const channelNameData = handlerInput.requestEnvelope.request.intent.slots.groupunreadschannelname.value;
			const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getGroupId(channelName, headers);
			const unreadCount = await helperFunctions.getGroupUnreadCounter(roomid, headers);
			const speechText = await helperFunctions.groupUnreadMessages(channelName, roomid, unreadCount, headers);
			let repromptText = ri('GENERIC_REPROMPT');


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
			let repromptText = ri('GENERIC_REPROMPT');


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
	async canHandle(handlerInput) {
		const attributesManager = handlerInput.attributesManager;
		const attributes = await attributesManager.getPersistentAttributes() || {};
	
		if(!attributes.hasOwnProperty('inPlaybackSession') || attributes.inPlaybackSession == false){
			return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			(handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
				handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
					handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
		}
	},
	handle(handlerInput) {
		const speechText = ri('GOODBYE.MESSAGE');

		return handlerInput.jrb
			.speak(speechText)
			.withSimpleCard(ri('GOODBYE.CARD_TITLE'), speechText)
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR'
			})
			.getResponse();
	},
};

const StartPlaybackHandler = {
	async canHandle(handlerInput) {
		
	  const attributesManager = handlerInput.attributesManager;
	  const attributes = await attributesManager.getPersistentAttributes() || {};

	  if(attributes.hasOwnProperty('inPlaybackSession') && attributes.inPlaybackSession == true){
		const request = handlerInput.requestEnvelope.request;
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

		const attributesManager = handlerInput.attributesManager;
		const attributes = await attributesManager.getPersistentAttributes() || {};
		
		const playBehavior = 'REPLACE_ALL';
		const token = fileurl.split('/').slice(-2)[0];
		const offsetInMilliseconds = 0;

		if (supportsDisplay(handlerInput)) {

			const metadata = {
				"title": "Rocket.Chat",
				"subtitle": "You have received an audio message!",
				"art": {
				"sources": [
					{
					"url": "https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png"
					}
				]
				},
				"backgroundImage": {
				"sources": [
					{
					"url": "https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png"
					}
				]
				}
			}

			return handlerInput.jrb
				.speak("You have received an audio message!")
				.addAudioPlayerPlayDirective(playBehavior, attributes.playBackURL, token, offsetInMilliseconds, null, metadata)
				.getResponse();

		} else {

			return handlerInput.jrb
				.speak("You have received an audio message!")
				.addAudioPlayerPlayDirective(playBehavior, attributes.playBackURL, token, offsetInMilliseconds, null, null)
				.getResponse();
		}
	},
};

const AudioControlPlaybackHandler = {
	async canHandle(handlerInput) {
	  const request = handlerInput.requestEnvelope.request;
  
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
	  const attributesManager = handlerInput.attributesManager;
	  const attributes = await attributesManager.getPersistentAttributes() || {};
  
	  if(attributes.hasOwnProperty('inPlaybackSession') && attributes.inPlaybackSession == true){
		const request = handlerInput.requestEnvelope.request;
  
		return request.type === 'IntentRequest' &&
		  (request.intent.name === 'AMAZON.StopIntent' ||
			request.intent.name === 'AMAZON.CancelIntent' ||
			request.intent.name === 'AMAZON.PauseIntent');
	  }
	  return false;
	},
	async handle(handlerInput) {
		
		const attributesManager = handlerInput.attributesManager;
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
				updateBehavior: 'CLEAR'
			})
			.addAudioPlayerStopDirective()
			.getResponse();
	},
};

const AudioPlayerEventHandler = {
	canHandle(handlerInput) {
	  return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
	},
	async handle(handlerInput) {
		
	  const attributesManager = handlerInput.attributesManager;
	  const attributes = await attributesManager.getPersistentAttributes() || {};
	  attributes.inPlaybackSession = true;
		
	  const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
  
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
		helperFunctions.customLog({session_ended_reason: handlerInput.requestEnvelope.request.reason})

		return handlerInput.responseBuilder
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR'
			})
			.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${ error.message }`);
		helperFunctions.customLog({errorMessage: error.message})
		const speechText = ri('ERRORS');

		return handlerInput.jrb
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	},
};

const RequestLog = {
  process(handlerInput) {
	console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
	helperFunctions.customLog(handlerInput.requestEnvelope)
  },
};

const ResponseLog = {
  process(handlerInput) {
	console.log(`RESPONSE BUILDER = ${JSON.stringify(handlerInput)}`);
	helperFunctions.customLog(handlerInput.requestEnvelope)
  },
};

const { LaunchRequestHandler } = require('./handlers/launchRequest')

const { 
	StartedCreateChannelIntentHandler,
	InProgressCreateChannelIntentHandler,
	DeniedCreateChannelIntentHandler,
	CreateChannelIntentHandler
} = require('./handlers/createChannel')

const {
	StartedDeleteChannelIntentHandler,
	InProgressDeleteChannelIntentHandler,
	DeniedDeleteChannelIntentHandler,
	DeleteChannelIntentHandler
} = require('./handlers/deleteChannel')

const {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler
} = require('./handlers/postMessage')

const {
    StartedPostDirectMessageIntentHandler,
    InProgressPostDirectMessageIntentHandler,
    DeniedPostDirectMessageIntentHandler,
    PostDirectMessageIntentHandler
} = require('./handlers/directMessage')

const {
	StartedPostLongMessageIntentHandler,
	InProgressPostLongMessageIntentHandler,
	PostLongMessageIntentHandler
} = require('./handlers/postLongMessage')

const { PostEmojiMessageIntentHandler } = require('./handlers/postEmojiMessage')

const { GetLastMessageFromChannelIntentHandler } = require('./handlers/getLastMessageFromChannel')

const skillBuilder = new Jargon.JargonSkillBuilder({ mergeSpeakAndReprompt: true }).installOnto(Alexa.SkillBuilders.standard());

const buildSkill = (skillBuilder) => 
		skillBuilder
		.addRequestHandlers(
			ProactiveEventHandler,
			LaunchRequestHandler,
			ChangeNotificationSettingsIntentHandler,
			StartedCreateChannelIntentHandler,
			InProgressCreateChannelIntentHandler,
			DeniedCreateChannelIntentHandler,
			CreateChannelIntentHandler,
			StartedDeleteChannelIntentHandler,
			InProgressDeleteChannelIntentHandler,
			DeniedDeleteChannelIntentHandler,
			DeleteChannelIntentHandler,
			StartedPostMessageIntentHandler,
			InProgressPostMessageIntentHandler,
			DeniedPostMessageIntentHandler,
			PostMessageIntentHandler,
			StartedPostDirectMessageIntentHandler,
			InProgressPostDirectMessageIntentHandler,
			DeniedPostDirectMessageIntentHandler,
			PostDirectMessageIntentHandler,
			StartedPostLongMessageIntentHandler,
			InProgressPostLongMessageIntentHandler,
			YesIntentHandler,
			NoIntentHandler,
			PostLongMessageIntentHandler,
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
			PostGroupEmojiMessageIntentHandler,
			GroupLastMessageIntentHandler,
			GetGroupUnreadMessagesIntentHandler,
			PostEmojiDirectMessageIntentHandler,
			HelpIntentHandler,
			CancelAndStopIntentHandler,
			SessionEndedRequestHandler,
			StartPlaybackHandler,
			PausePlaybackHandler,
			AudioControlPlaybackHandler,
			AudioPlayerEventHandler
		)
		.addErrorHandlers(ErrorHandler)
		.addRequestInterceptors(RequestLog)
		.addResponseInterceptors(ResponseLog)
		.withTableName(envVariables.dynamoDBTableName)
		.withAutoCreateTable(true)
		.lambda();

// this code enables local development
// the DEVELOPMENT environment variable has to be set to true for local development
if(process.env.DEVELOPMENT){
	require('dotenv').config()
	require("ask-sdk-model")

	// configuring aws
	var AWS = require('aws-sdk');
	AWS.config.update({region: 'us-east-1'});
	AWS.config.update({credentials: {
		accessKeyId: envVariables.awsAccessKeyId,
		secretAccessKey: envVariables.awsSecretAccessKey
	}})

	buildSkill(skillBuilder)

	const skill = skillBuilder.create();

	const express = require('express');
	const { ExpressAdapter } = require('ask-sdk-express-adapter');
	const app = express();

	const adapter = new ExpressAdapter(skill, false, false);
	
	app.post('/', adapter.getRequestHandlers());

	const port = process.env.PORT || 3000
	app.listen(port, () => {
		console.log(`Listening at port ${port}`)
	});
}else{
	exports.handler = buildSkill(skillBuilder)
}