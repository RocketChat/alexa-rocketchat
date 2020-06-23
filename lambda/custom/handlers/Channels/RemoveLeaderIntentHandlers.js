const Alexa = require('ask-sdk-core');
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, removeLeader, getUsersWithRolesFromRoom, resolveChannelname } = require('../../helperFunctions');

const RemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		const headers = await login(accessToken);

		const speakOutput = await removeLeader(sessionAttributes.channel.id, sessionAttributes.user._id, sessionAttributes.channel.name, sessionAttributes.user.username, sessionAttributes.channel.type, headers);
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const DeniedRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {

		const speakOutput = ri('ROOM_ROLES.ADD_LEADER_DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const UnconfirmedLeaderRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.username.confirmationStatus === 'NONE'
            && handlerInput.requestEnvelope.request.intent.slots.username.value;
	},
	async handle(handlerInput) {
		const updatedIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = updatedIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		if (updatedSlots.choice && updatedSlots.choice.value) {
			// get the array of users which the user was asked for
			const users = sessionAttributes.similarusers;

			// if the user selects an invalid choice then ask for an appropriate choice
			if (Number(updatedSlots.choice.value) === 0 || Number(updatedSlots.choice.value) > users.length) {
				let users_list = '';
				for (const { username } of users) {
					users_list += `${ username }, `;
				}
				const speechText = ri('RESOLVE_USERNAME.ASK_CHOICE', { choice_limit: users.length, users_list });
				const slotName = 'choice';
				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}

			// if everything is correct then proceed to ask for confirmation
			const userDetails = users[Number(updatedSlots.choice.value) - 1];
			updatedSlots.username.value = userDetails.username;
			sessionAttributes.user = userDetails;
			delete updatedSlots.choice.value;
			return handlerInput.responseBuilder
				.addDelegateDirective(updatedIntent)
				.getResponse();
		}

		if (updatedSlots.username.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar usernames
			const users = await getUsersWithRolesFromRoom(updatedSlots.username.value, sessionAttributes.channel.id, sessionAttributes.channel.type, 'leader', headers);

			if (users.length === 0) {
				const speechText = ri('ROOM_ROLES.USER_NOT_LEADER', { username: updatedSlots.username.value, roomname: sessionAttributes.channel.name });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
				// if there's only one similar channel, then change the slot value to the matching channel
			} else if (users.length === 1) {
				updatedSlots.username.value = users[0].username;
				sessionAttributes.user = users[0];
			} else {
				sessionAttributes.similarusers = users;
				let user_names = '';
				for (const { username } of users) {
					user_names += `${ username }, `;
				}

				const speechText = ri('RESOLVE_USERNAME.SIMILAR_USERS', { user_names });
				const slotName = 'choice';


				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(updatedIntent)
			.getResponse();

	},
};

const UnconfirmedChannelRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.slots.channelname.confirmationStatus === 'NONE'
            && handlerInput.requestEnvelope.request.intent.slots.channelname.value;
	},
	async handle(handlerInput) {
		const updatedIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = updatedIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		if (updatedSlots.choice && updatedSlots.choice.value) {
			// get the array of users which the user was asked for
			const channels = sessionAttributes.similarchannels;

			// if the user selects an invalid choice then ask for an appropriate choice
			if (Number(updatedSlots.choice.value) === 0 || Number(updatedSlots.choice.value) > channels.length) {
				let channels_list = '';
				for (const { name } of channels) {
					channels_list += `${ name }, `;
				}
				const speechText = ri('RESOLVE_CHANNEL.ASK_CHOICE', { choice_limit: channels.length, channels_list });
				const slotName = 'choice';
				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}

			// if everything is correct then proceed to ask for confirmation
			const userDetails = channels[Number(updatedSlots.choice.value) - 1];
			updatedSlots.channelname.value = userDetails.name;
			sessionAttributes.channel = userDetails;
			delete updatedSlots.choice.value;
			return handlerInput.responseBuilder
				.addDelegateDirective(updatedIntent)
				.getResponse();
		}

		if (updatedSlots.channelname.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar usernames
			const channels = await resolveChannelname(updatedSlots.channelname.value, headers);

			if (channels.length === 0) {
				const speechText = ri('RESOLVE_CHANNEL.NO_CHANNEL', { channel_name: updatedSlots.channelname.value });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
				// if there's only one similar channel, then change the slot value to the matching channel
			} else if (channels.length === 1) {
				updatedSlots.channelname.value = channels[0].name;
				sessionAttributes.channel = channels[0];
			} else {
				sessionAttributes.similarchannels = channels;
				let channel_names = '';
				for (const { name } of channels) {
					channel_names += `${ name }, `;
				}

				const speechText = ri('RESOLVE_CHANNEL.SIMILAR_CHANNELS', { channel_names });
				const slotName = 'choice';


				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}
		}

		return handlerInput.responseBuilder
			.addDelegateDirective(updatedIntent)
			.getResponse();

	},
};

const InProgressRemoveLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RemoveLeaderIntent'
            && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
	},
	handle(handlerInput) {
		const updatedIntent = handlerInput.requestEnvelope.request.intent;

		return handlerInput.responseBuilder
			.addDelegateDirective(updatedIntent)
			.getResponse();
	},
};

module.exports = {
	RemoveLeaderIntentHandler,
	DeniedRemoveLeaderIntentHandler,
	UnconfirmedLeaderRemoveLeaderIntentHandler,
	UnconfirmedChannelRemoveLeaderIntentHandler,
	InProgressRemoveLeaderIntentHandler,
};
