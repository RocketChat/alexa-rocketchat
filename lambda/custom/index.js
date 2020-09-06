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

const {
	StartedAddOwnerIntentHandler,
	AddOwnerIntentHandler,
	DeniedAddOwnerIntentHandler,
	InProgressAddOwnerIntentHandler,
} = require('./handlers/Channels/AddOwnerIntentHandler');

const {
	StartedAddModeratorIntentHandler,
	AddModeratorIntentHandler,
	DeniedAddModeratorIntentHandler,
	InProgressAddModeratorIntentHandler,
} = require('./handlers/Channels/AddModeratorIntentHandlers');

const {
	StartedArchiveChannelIntentHandler,
	InProgressArchiveChannelIntentHandler,
	DeniedArchiveChannelIntentHandler,
	ArchiveChannelIntentHandler,
} = require('./handlers/Channels/ArchiveChannelIntentHandler');

const {
	StartedUnarchiveChannelIntentHandler,
	InProgressUnarchiveChannelIntentHandler,
	DeniedUnarchiveChannelIntentHandler,
	UnarchiveChannelIntentHandler,
} = require('./handlers/Channels/UnarchiveChannelIntentHandlers');

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
	StartedKickUserIntentHandler,
	KickUserIntentHandler,
	DeniedKickUserIntentHandler,
	InProgressKickUserIntentHandler,
} = require('./handlers/Channels/KickUserIntentHandlers');

const {
	StartPlaybackHandler,
	AudioControlPlaybackHandler,
	PausePlaybackHandler,
	AudioPlayerEventHandler,
} = require('./handlers/General/PlaybackIntentHandlers');

const { AddAllToChannelIntentHandler } = require('./handlers/Channels/AddAllToChannelIntentHandler');

const {
	CreateGrouplIntentHandler,
	DeniedCreateGroupIntentHandler,
} = require('./handlers/Channels/CreateGrouplIntentHandler');

const { PostEmojiDirectMessageIntentHandler } = require('./handlers/Direct/PostEmojiDirectMessageIntentHandler');

const {
	StartedPostDiscussionMessageIntentHandler,
	InProgressPostDiscussionMessageIntentHandler,
	DeniedPostDiscussionMessageIntentHandler,
	PostDiscussionMessageIntentHandler,
} = require('./handlers/Channels/PostDiscussionMessageIntentHandlers');

const {
	ReadUnreadsFromDiscussionIntentHandler,
} = require('./handlers/Channels/ReadUnreadsFromDiscussionIntentHandlers');

const {
	ReadUnreadMentionsFromDiscussionIntentHandler,
} = require('./handlers/Channels/ReadUnreadMentionsFromDiscussionIntentHandlers');

const { FallbackIntentHandler } = require('./handlers/General/FallbackIntentHandler');

const { HelpIntentHandler } = require('./handlers/General/HelpIntentHandler');

const { CancelAndStopIntentHandler } = require('./handlers/General/CancelAndStopIntentHandler');

const {
	StartedAddLeaderIntentHandler,
	DeniedAddLeaderIntentHandler,
	InProgressAddLeaderIntentHandler,
	AddLeaderIntentHandler,
} = require('./handlers/Channels/AddLeaderIntentHandlers');

const {
	StartedRemoveLeaderIntentHandler,
	RemoveLeaderIntentHandler,
	DeniedRemoveLeaderIntentHandler,
	InProgressRemoveLeaderIntentHandler,
} = require('./handlers/Channels/RemoveLeaderIntentHandlers');

const {
	StartedRemoveOwnerIntentHandler,
	RemoveOwnerIntentHandler,
	DeniedRemoveOwnerIntentHandler,
	InProgressRemoveOwnerIntentHandler,
} = require('./handlers/Channels/RemoveOwnerIntentHandlers');

const {
	StartedRemoveModeratorIntentHandler,
	RemoveModeratorIntentHandler,
	DeniedRemoveModeratorIntentHandler,
	InProgressRemoveModeratorIntentHandler,
} = require('./handlers/Channels/RemoveModeratorIntentHandlers');

const {
	ReadPinnedMessagesIntentHandler,
} = require('./handlers/Channels/ReadPinnedMessagesIntentHandlers');

const { GetMentionsIntentHandler } = require('./handlers/Channels/GetMentionsIntentHandlers');

const { ReadUnreadMentionsFromRoomIntentHandler } = require('./handlers/Channels/ReadUnreadMentionsFromRoomIntentHandler');

const { GetUnreadsIntentHandler } = require('./handlers/Channels/GetUnreadsIntentHandler');

const { YesIntentHandler } = require('./handlers/General/YesIntentHandler');

const { NoIntentHandler } = require('./handlers/General/NoIntentHandler');

const { SessionEndedRequestHandler } = require('./handlers/General/SessionEndedRequestHandler');

const { ErrorHandler } = require('./handlers/General/ErrorHandler');

const { ResponseLog } = require('./handlers/Interceptors/ResponseLog');

const { RequestLog } = require('./handlers/Interceptors/RequestLog');

const APLLocalisationRequestInterceptor = require('./handlers/Interceptors/APLLocalisationRequestInterceptor');

const {
	StartedSetAnnouncementIntentHandler,
	InProgressSetAnnouncementIntentHandler,
	DeniedSetAnnouncementIntentHandler,
	SetAnnouncementIntentHandler,
} = require('./handlers/Channels/SetAnnouncementIntentHandlers');

const {
	StartedSetDescriptionIntentHandler,
	InProgressSetDescriptionIntentHandler,
	DeniedSetDescriptionIntentHandler,
	SetDescriptionIntentHandler,
} = require('./handlers/Channels/SetDescriptionIntentHandlers');

const {
	StartedSetTopicIntentHandler,
	InProgressSetTopicIntentHandler,
	DeniedSetTopicIntentHandler,
	SetTopicIntentHandler,
} = require('./handlers/Channels/SetTopicIntentHandlers');

const {
	StartedRenameChannelIntentHandler,
	InProgressRenameChannelIntentHandler,
	DeniedRenameChannelIntentHandler,
	RenameChannelIntentHandler,
} = require('./handlers/Channels/RenameChannelIntentHandlers');

const { HintGenerationResponseInterceptor } = require('./handlers/Interceptors/HintGenerationResponseInterceptor');

const {
	DeniedChangeStatusIntentHandler,
	ChangeStatusIntentHandler,
} = require('./handlers/General/ChangeStatusIntentHandlers');

const { ReadUnreadsFromRoomIntentHandler } = require('./handlers/Channels/ReadUnreadsFromRoomIntentHandlers');

const { ReadUnreadsFromDMIntentHandler } = require('./handlers/Direct/ReadUnreadsFromDMIntentHandler');

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
			StartedAddOwnerIntentHandler,
			AddOwnerIntentHandler,
			DeniedAddOwnerIntentHandler,
			InProgressAddOwnerIntentHandler,
			StartedAddModeratorIntentHandler,
			AddModeratorIntentHandler,
			DeniedAddModeratorIntentHandler,
			InProgressAddModeratorIntentHandler,
			ArchiveChannelIntentHandler,
			CreateGrouplIntentHandler,
			DeniedCreateGroupIntentHandler,
			PostEmojiDirectMessageIntentHandler,
			StartedSetAnnouncementIntentHandler,
			InProgressSetAnnouncementIntentHandler,
			DeniedSetAnnouncementIntentHandler,
			SetAnnouncementIntentHandler,
			StartedSetDescriptionIntentHandler,
			InProgressSetDescriptionIntentHandler,
			DeniedSetDescriptionIntentHandler,
			SetDescriptionIntentHandler,
			StartedSetTopicIntentHandler,
			InProgressSetTopicIntentHandler,
			DeniedSetTopicIntentHandler,
			SetTopicIntentHandler,
			StartedRenameChannelIntentHandler,
			InProgressRenameChannelIntentHandler,
			DeniedRenameChannelIntentHandler,
			RenameChannelIntentHandler,
			StartedArchiveChannelIntentHandler,
			InProgressArchiveChannelIntentHandler,
			DeniedArchiveChannelIntentHandler,
			ArchiveChannelIntentHandler,
			StartedUnarchiveChannelIntentHandler,
			InProgressUnarchiveChannelIntentHandler,
			DeniedUnarchiveChannelIntentHandler,
			UnarchiveChannelIntentHandler,
			StartedAddLeaderIntentHandler,
			AddLeaderIntentHandler,
			DeniedAddLeaderIntentHandler,
			InProgressAddLeaderIntentHandler,
			StartedRemoveLeaderIntentHandler,
			RemoveLeaderIntentHandler,
			DeniedRemoveLeaderIntentHandler,
			InProgressRemoveLeaderIntentHandler,
			StartedRemoveOwnerIntentHandler,
			RemoveOwnerIntentHandler,
			DeniedRemoveOwnerIntentHandler,
			InProgressRemoveOwnerIntentHandler,
			StartedRemoveModeratorIntentHandler,
			RemoveModeratorIntentHandler,
			DeniedRemoveModeratorIntentHandler,
			InProgressRemoveModeratorIntentHandler,
			StartedLeaveChannelIntentHandler,
			InProgressLeaveChannelIntentHandler,
			DeniedLeaveChannelIntentHandler,
			LeaveChannelIntentHandler,
			StartedPostDiscussionMessageIntentHandler,
			InProgressPostDiscussionMessageIntentHandler,
			DeniedPostDiscussionMessageIntentHandler,
			PostDiscussionMessageIntentHandler,
			ReadUnreadsFromDiscussionIntentHandler,
			ReadUnreadMentionsFromDiscussionIntentHandler,
			FallbackIntentHandler,
			StartedInviteUserIntentHandler,
			InviteUserIntentHandler,
			DeniedInviteUserIntentHandler,
			InProgressInviteUserIntentHandler,
			StartedKickUserIntentHandler,
			KickUserIntentHandler,
			DeniedKickUserIntentHandler,
			InProgressKickUserIntentHandler,
			DeniedChangeStatusIntentHandler,
			ChangeStatusIntentHandler,
			ReadPinnedMessagesIntentHandler,
			GetMentionsIntentHandler,
			ReadUnreadMentionsFromRoomIntentHandler,
			GetUnreadsIntentHandler,
			ReadUnreadsFromRoomIntentHandler,
			ReadUnreadsFromDMIntentHandler,
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
		.addResponseInterceptors(
			HintGenerationResponseInterceptor,
			ResponseLog,
		)
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
