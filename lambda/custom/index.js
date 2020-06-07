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

const { ChangeNotificationSettingsIntentHandler } = require('./handlers/changeNotificationSettings')

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

const {
	YesIntentHandler,
	NoIntentHandler,
	CancelAndStopIntentHandler,
	HelpIntentHandler
} = require('./handlers/builtinIntents')

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
		// .addRequestInterceptors(RequestLog)
		// .addResponseInterceptors(ResponseLog)
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