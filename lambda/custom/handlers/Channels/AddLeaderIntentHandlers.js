const Alexa = require('ask-sdk-core');
const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveUsername, resolveChannelname, addLeader } = require('../../helperFunctions');

const AddLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		const headers = await login(accessToken);

		const speakOutput = await addLeader(sessionAttributes.channel.id, sessionAttributes.user.id, sessionAttributes.channel.name, sessionAttributes.user.name, headers);
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speakOutput)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const DeniedAddLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddLeaderIntent'
            && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {

		const speakOutput = "Okay, I won't add any leader, anything else I can help you with?";
		console.log('The request was DENIED');

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt()
			.getResponse();
	},
};

const UnconfirmedLeaderAddLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddLeaderIntent'
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
				for (const { name } of users) {
					users_list += `${ name }, `;
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
			updatedSlots.username.value = userDetails.name;
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
			const users = await resolveUsername(updatedSlots.username.value, headers);

			if (users.length === 0) {
				const speechText = ri('RESOLVE_USERNAME.NO_USER', { username: updatedSlots.username.value });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
				// if there's only one similar channel, then change the slot value to the matching channel
			} else if (users.length === 1) {
				updatedSlots.username.value = users[0].name;
				sessionAttributes.user = users[0];
			} else {
				sessionAttributes.similarusers = users;
				let user_names = '';
				for (const { name } of users) {
					user_names += `${ name }, `;
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

const UnconfirmedChannelAddLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddLeaderIntent'
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
				const speechText = ri('RESOLVE_CHANNEL.NO_CHANNEL', { channelname: updatedSlots.channelname.value });
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

const InProgressAddLeaderIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddLeaderIntent'
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
	AddLeaderIntentHandler,
	DeniedAddLeaderIntentHandler,
	UnconfirmedLeaderAddLeaderIntentHandler,
	UnconfirmedChannelAddLeaderIntentHandler,
	InProgressAddLeaderIntentHandler,
};
