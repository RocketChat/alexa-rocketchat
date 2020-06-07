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
} = require('./handlers/NotificationSettingHandlers');

const { LaunchRequestHandler } = require('./handlers/LaunchRequestHandler');

const {
	StartedCreateChannelIntentHandler,
	InProgressCreateChannelIntentHandler,
	DeniedCreateChannelIntentHandler,
	CreateChannelIntentHandler,
} = require('./handlers/CreateChannelIntentHandlers');

const {
	StartedDeleteChannelIntentHandler,
	InProgressDeleteChannelIntentHandler,
	DeniedDeleteChannelIntentHandler,
	DeleteChannelIntentHandler,
} = require('./handlers/DeleteChannelIntentHandlers');

const {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler,
} = require('./handlers/PostMessageIntentHandlers');

const {
	StartedPostDirectMessageIntentHandler,
	InProgressPostDirectMessageIntentHandler,
	DeniedPostDirectMessageIntentHandler,
	PostDirectMessageIntentHandler,
} = require('./handlers/PostDirectMessageIntentHandlers');

const {
	StartedPostLongMessageIntentHandler,
	InProgressPostLongMessageIntentHandler,
	PostLongMessageIntentHandler,
} = require('./handlers/PostLongMessageIntentHandlers');

const { PostEmojiMessageIntentHandler } = require('./handlers/PostEmojiMessageIntentHandler');

const { GetLastMessageFromChannelIntentHandler } = require('./handlers/GetLastMessageFromChannelIntentHandler');

const { AddOwnerIntentHandler } = require('./handlers/AddOwnerIntentHandler');

const { ArchiveChannelIntentHandler } = require('./handlers/ArchiveChannelIntentHandler');

const {
	StartPlaybackHandler,
	AudioControlPlaybackHandler,
	PausePlaybackHandler,
	AudioPlayerEventHandler,
} = require('./handlers/PlaybackIntentHandlers');

const { GetUnreadMessagesIntentHandler } = require('./handlers/GetUnreadMessagesIntentHandler');

const { AddAllToChannelIntentHandler } = require('./handlers/AddAllToChannelIntentHandler');

const { MakeModeratorIntentHandler } = require('./handlers/MakeModeratorIntentHandler');

const { CreateGrouplIntentHandler } = require('./handlers/CreateGrouplIntentHandler');

const { PostEmojiDirectMessageIntentHandler } = require('./handlers/PostEmojiDirectMessageIntentHandler');

const {
	DeleteGroupIntentHandler,
	MakeGroupModeratorIntentHandler,
	MakeGroupOwnerIntentHandler,
	PostGroupEmojiMessageIntentHandler,
	GroupLastMessageIntentHandler,
	GetGroupUnreadMessagesIntentHandler,
} = require('./handlers/PrivateChannelIntents');

const {
	YesIntentHandler,
	NoIntentHandler,
	CancelAndStopIntentHandler,
	HelpIntentHandler,
} = require('./handlers/builtinIntents');

const { SessionEndedRequestHandler } = require('./handlers/SessionEndedRequestHandler');

const { ErrorHandler } = require('./handlers/ErrorHandler');

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
