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

const { AddOwnerIntentHandler } = require('./handlers/addOwner')

const { ArchiveChannelIntentHandler } = require('./handlers/archiveChannel')

const {
	StartPlaybackHandler,
    AudioControlPlaybackHandler,
    PausePlaybackHandler
} = require('./handlers/playback')

const { GetUnreadMessagesIntentHandler } = require('./handlers/getUnreadMessages')

const { AddAllToChannelIntentHandler } = require('./handlers/addAllToChannel')

const { MakeModeratorIntentHandler } = require('./handlers/makeModerator')

const { CreateGrouplIntentHandler } = require('./handlers/createGroup')

const { PostEmojiDirectMessageIntentHandler } = require('./handlers/postEmojiDirectMessage')

const {
	DeleteGroupIntentHandler,
    MakeGroupModeratorIntentHandler,
    MakeGroupOwnerIntentHandler,
    PostGroupEmojiMessageIntentHandler,
    GroupLastMessageIntentHandler,
    GetGroupUnreadMessagesIntentHandler
} = require('./handlers/privateChannelIntents')

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