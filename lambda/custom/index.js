/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const envVariables = require('./config');

// Jargon for Localization
const Jargon = require('@jargon/alexa-skill-sdk');

// Alexa Intent Functions

const {
	ProactiveEventHandler,
	ChangeNotificationSettingsIntentHandler,
} = require('./handlers/changeNotificationSettings');

const { LaunchRequestHandler } = require('./handlers/launchRequest');

const {
	StartedCreateChannelIntentHandler,
	InProgressCreateChannelIntentHandler,
	DeniedCreateChannelIntentHandler,
	CreateChannelIntentHandler,
} = require('./handlers/createChannel');

const {
	StartedDeleteChannelIntentHandler,
	InProgressDeleteChannelIntentHandler,
	DeniedDeleteChannelIntentHandler,
	DeleteChannelIntentHandler,
} = require('./handlers/deleteChannel');

const {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler,
} = require('./handlers/postMessage');

const {
	StartedPostDirectMessageIntentHandler,
	InProgressPostDirectMessageIntentHandler,
	DeniedPostDirectMessageIntentHandler,
	PostDirectMessageIntentHandler,
} = require('./handlers/directMessage');

const {
	StartedPostLongMessageIntentHandler,
	InProgressPostLongMessageIntentHandler,
	PostLongMessageIntentHandler,
} = require('./handlers/postLongMessage');

const { PostEmojiMessageIntentHandler } = require('./handlers/postEmojiMessage');

const { GetLastMessageFromChannelIntentHandler } = require('./handlers/getLastMessageFromChannel');

const { AddOwnerIntentHandler } = require('./handlers/addOwner');

const { ArchiveChannelIntentHandler } = require('./handlers/archiveChannel');

const {
	StartPlaybackHandler,
	AudioControlPlaybackHandler,
	PausePlaybackHandler,
	AudioPlayerEventHandler,
} = require('./handlers/playback');

const { GetUnreadMessagesIntentHandler } = require('./handlers/getUnreadMessages');

const { AddAllToChannelIntentHandler } = require('./handlers/addAllToChannel');

const { MakeModeratorIntentHandler } = require('./handlers/makeModerator');

const { CreateGrouplIntentHandler } = require('./handlers/createGroup');

const { PostEmojiDirectMessageIntentHandler } = require('./handlers/postEmojiDirectMessage');

const {
	DeleteGroupIntentHandler,
	MakeGroupModeratorIntentHandler,
	MakeGroupOwnerIntentHandler,
	PostGroupEmojiMessageIntentHandler,
	GroupLastMessageIntentHandler,
	GetGroupUnreadMessagesIntentHandler,
} = require('./handlers/privateChannelIntents');

const {
	YesIntentHandler,
	NoIntentHandler,
	CancelAndStopIntentHandler,
	HelpIntentHandler,
} = require('./handlers/builtinIntents');

const {
	SessionEndedRequestHandler,
	ErrorHandler,
} = require('./handlers/helperIntents');

const {
	RequestLog,
	ResponseLog,
} = require('./interceptors');

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
if (process.env.DEVELOPMENT) {
	require('dotenv').config();
	require('ask-sdk-model');

	// configuring aws
	const AWS = require('aws-sdk');
	AWS.config.update({ region: 'us-east-1' });
	AWS.config.update({ credentials: {
		accessKeyId: envVariables.awsAccessKeyId,
		secretAccessKey: envVariables.awsSecretAccessKey,
	} });

	buildSkill(skillBuilder);

	const skill = skillBuilder.create();

	const express = require('express');
	const { ExpressAdapter } = require('ask-sdk-express-adapter');
	const app = express();

	const adapter = new ExpressAdapter(skill, false, false);

	app.post('/', adapter.getRequestHandlers());

	const port = process.env.PORT || 3000;
	app.listen(port, () => {
		console.log(`Listening at port ${ port }`);
	});
} else {
	exports.handler = buildSkill(skillBuilder);
}
