/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const helperFunctions = require('./helperFunctions');


// Alexa Intent Functions

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	async handle(handlerInput) {

		if (handlerInput.requestEnvelope.context.System.user.accessToken === undefined) {

			const speechText = 'To start using this skill, please use the companion app to authenticate.';

			return handlerInput.responseBuilder
				.speak(speechText)
				.withLinkAccountCard()
				.getResponse();
		}
		const speechText = 'Welcome To Rocket Chat Alexa Skill. What Would you like to do today ?';

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('Welcome To Rocket.Chat', speechText)
			.getResponse();

	},
};

const CreateChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.createChannel(channelName, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Create A Channel', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const DeleteChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DeleteChannelIntent';
	},
	async handle(handlerInput) {
		try {
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const channelName = handlerInput.requestEnvelope.request.intent.slots.channeldelete.value;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.deleteChannel(channelName, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Delete A Channel', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const PostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent';
	},
	async handle(handlerInput) {
		try {
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			const channelName = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.postMessage(channelName, message, headers);


			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Post A Message', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const GetLastMessageFromChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetLastMessageFromChannel';
	},
	async handle(handlerInput) {
		try {
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const channelName = handlerInput.requestEnvelope.request.intent.slots.getmessagechannelname.value;

			const headers = await helperFunctions.login(accessToken);
			const speechText = await helperFunctions.channelLastMessage(channelName, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Channel Message', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const GetUnreadMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsIntent';
	},
	async handle(handlerInput) {
		try {
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;
			const channelName = handlerInput.requestEnvelope.request.intent.slots.readunreadschannel.value;

			const headers = await helperFunctions.login(accessToken);
			const unreadCount = await helperFunctions.getUnreadCounter(channelName, headers);
			const speechText = await helperFunctions.channelUnreadMessages(channelName, unreadCount, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Channel Message', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const AddAllToChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddAllToChannelIntent';
	},
	async handle(handlerInput) {
		try {

			const { accessToken } = handlerInput.requestEnvelope.context.System.user;
			const channelName = handlerInput.requestEnvelope.request.intent.slots.addallchannelname.value;

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.addAll(channelName, roomid, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Add All To Server', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const MakeModeratorIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MakeModeratorIntent';
	},
	async handle(handlerInput) {
		try {

			const userName = handlerInput.requestEnvelope.request.intent.slots.moderatorusername.value;
			const channelName = handlerInput.requestEnvelope.request.intent.slots.moderatorchannelname.value;
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.makeModerator(userName, channelName, userid, roomid, headers);


			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Make Moderator', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const AddOwnerIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent';
	},
	async handle(handlerInput) {
		try {

			const userName = handlerInput.requestEnvelope.request.intent.slots.ownerusername.value;
			const channelName = handlerInput.requestEnvelope.request.intent.slots.ownerchannelname.value;
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const headers = await helperFunctions.login(accessToken);
			const userid = await helperFunctions.getUserId(userName, headers);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.addOwner(userName, channelName, userid, roomid, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Add Owner', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const ArchiveChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ArchiveChannelIntent';
	},
	async handle(handlerInput) {
		try {

			const channelName = handlerInput.requestEnvelope.request.intent.slots.archivechannelname.value;
			const { accessToken } = handlerInput.requestEnvelope.context.System.user;

			const headers = await helperFunctions.login(accessToken);
			const roomid = await helperFunctions.getRoomId(channelName, headers);
			const speechText = await helperFunctions.archiveChannel(channelName, roomid, headers);

			return handlerInput.responseBuilder
				.speak(speechText)
				.withSimpleCard('Archive Channel', speechText)
				.reprompt(speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

const HelpIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speechText = 'This is the Alexa Skill for rocket chat. Refer sample utterances file on GitHub.';

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('Rocket Chat', speechText)
			.getResponse();
	},
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speechText = 'Goodbye!';

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Rocket Chat', speechText)
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

		return handlerInput.responseBuilder
			.speak('Sorry, I can\'t understand the command. Please say again.')
			.reprompt('Sorry, I can\'t understand the command. Please say again.')
			.getResponse();
	},
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		CreateChannelIntentHandler,
		DeleteChannelIntentHandler,
		PostMessageIntentHandler,
		GetLastMessageFromChannelIntentHandler,
		AddAllToChannelIntentHandler,
		MakeModeratorIntentHandler,
		AddOwnerIntentHandler,
		ArchiveChannelIntentHandler,
		GetUnreadMessagesIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();
