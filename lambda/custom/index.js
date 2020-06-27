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
} = require('./handlers/Notifications/NotificationSettingHandlers');

const { LaunchRequestHandler } = require('./handlers/General/LaunchRequestHandler');

const {
	StartedCreateChannelIntentHandler,
	InProgressCreateChannelIntentHandler,
	DeniedCreateChannelIntentHandler,
	CreateChannelIntentHandler,
} = require('./handlers/Channels/CreateChannelIntentHandlers');

const {
	StartedDeleteChannelIntentHandler,
	InProgressDeleteChannelIntentHandler,
	DeniedDeleteChannelIntentHandler,
	DeleteChannelIntentHandler,
} = require('./handlers/Channels/DeleteChannelIntentHandlers');

const {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler,
} = require('./handlers/Channels/PostMessageIntentHandlers');

const {
	StartedPostDirectMessageIntentHandler,
	InProgressPostDirectMessageIntentHandler,
	DeniedPostDirectMessageIntentHandler,
	PostDirectMessageIntentHandler,
} = require('./handlers/Direct/PostDirectMessageIntentHandlers');

const {
	StartedPostLongMessageIntentHandler,
	InProgressPostLongMessageIntentHandler,
	PostLongMessageIntentHandler,
} = require('./handlers/Channels/PostLongMessageIntentHandlers');

const { PostEmojiMessageIntentHandler } = require('./handlers/Channels/PostEmojiMessageIntentHandler');

const { GetLastMessageFromChannelIntentHandler } = require('./handlers/Channels/GetLastMessageFromChannelIntentHandler');

const { AddOwnerIntentHandler } = require('./handlers/Channels/AddOwnerIntentHandler');

const { ArchiveChannelIntentHandler } = require('./handlers/Channels/ArchiveChannelIntentHandler');

const {
	StartedLeaveChannelIntentHandler,
	InProgressLeaveChannelIntentHandler,
	DeniedLeaveChannelIntentHandler,
	LeaveChannelIntentHandler,
} = require('./handlers/Channels/LeaveChannelIntentHandlers');

const {
	StartedInviteUserIntentHandler,
	InviteUserIntentHandler,
	DeniedInviteUserIntentHandler,
	InProgressInviteUserIntentHandler,
} = require('./handlers/Channels/InviteUserIntentHandlers');

const {
	StartPlaybackHandler,
	AudioControlPlaybackHandler,
	PausePlaybackHandler,
	AudioPlayerEventHandler,
} = require('./handlers/General/PlaybackIntentHandlers');

const { GetUnreadMessagesIntentHandler } = require('./handlers/Channels/GetUnreadMessagesIntentHandler');

const { AddAllToChannelIntentHandler } = require('./handlers/Channels/AddAllToChannelIntentHandler');

const { MakeModeratorIntentHandler } = require('./handlers/Channels/MakeModeratorIntentHandler');

const { CreateGrouplIntentHandler } = require('./handlers/Channels/CreateGrouplIntentHandler');

const { PostEmojiDirectMessageIntentHandler } = require('./handlers/Direct/PostEmojiDirectMessageIntentHandler');

const {
	DeleteGroupIntentHandler,
	MakeGroupModeratorIntentHandler,
	MakeGroupOwnerIntentHandler,
	PostGroupEmojiMessageIntentHandler,
	GroupLastMessageIntentHandler,
	GetGroupUnreadMessagesIntentHandler,
} = require('./handlers/Channels/PrivateChannelIntents');

const { HelpIntentHandler } = require('./handlers/General/HelpIntentHandler');

const { CancelAndStopIntentHandler } = require('./handlers/General/CancelAndStopIntentHandler');

const { YesIntentHandler } = require('./handlers/General/YesIntentHandler');

const { NoIntentHandler } = require('./handlers/General/NoIntentHandler');

const { SessionEndedRequestHandler } = require('./handlers/General/SessionEndedRequestHandler');

const { ErrorHandler } = require('./handlers/General/ErrorHandler');

const { ResponseLog } = require('./handlers/Interceptors/ResponseLog');

const { RequestLog } = require('./handlers/Interceptors/RequestLog');

const APLLocalisationRequestInterceptor = require('./handlers/Interceptors/APLLocalisationRequestInterceptor');

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
			StartedLeaveChannelIntentHandler,
			InProgressLeaveChannelIntentHandler,
			DeniedLeaveChannelIntentHandler,
			LeaveChannelIntentHandler,
			StartedInviteUserIntentHandler,
			InviteUserIntentHandler,
			DeniedInviteUserIntentHandler,
			InProgressInviteUserIntentHandler,
			HelpIntentHandler,
			CancelAndStopIntentHandler,
			SessionEndedRequestHandler,
			StartPlaybackHandler,
			PausePlaybackHandler,
			AudioControlPlaybackHandler,
			AudioPlayerEventHandler
		)
		.addErrorHandlers(ErrorHandler)
		.addRequestInterceptors(
			RequestLog,
			APLLocalisationRequestInterceptor,
		)
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
