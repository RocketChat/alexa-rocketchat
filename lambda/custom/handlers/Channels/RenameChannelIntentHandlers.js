const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, renameChannel } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageTemplate = require('../../APL/templates/titleMessageBoxTemplate');


const StartedRenameChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'RenameChannelIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	async handle(handlerInput) {
		// if the user tells both the slots while invoking the intent, resolutions of channelname has to take place in this handler
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		// clear session attribute from previous invocation if any
		delete sessionAttributes.channel;

		if (updatedSlots.newname && updatedSlots.newname.value) {
			updatedSlots.newname.value = updatedSlots.newname.value.trim().split(' ').join('');
		}


		if (updatedSlots.channelname.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar channelnames
			const channels = await resolveChannelname(updatedSlots.channelname.value, headers);

			// if there are no similar channels
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
				// if there are multiple channels with similar names
			} else {
				// store the similar channels in sessions Attributes and ask the user for a choice
				sessionAttributes.similarChannels = channels;
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
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressRenameChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'RenameChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		if (updatedSlots.newname && updatedSlots.newname.value) {
			updatedSlots.newname.value = updatedSlots.newname.value.trim().split(' ').join('');
		}

		// if a choice is present and has a value, it means the user has already made a choice on which channel to choose from
		if (updatedSlots.choice && updatedSlots.choice.value) {

			// get the array of channels which the user was asked for
			const channels = sessionAttributes.similarChannels;

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
			const channelDetails = channels[Number(updatedSlots.choice.value) - 1];
			updatedSlots.channelname.value = channelDetails.name;
			sessionAttributes.channel = channelDetails;
			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();
		}

		// if the user has told the channel name to alexa
		if (updatedSlots.channelname.value && !sessionAttributes.channel) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar channelnames
			const channels = await resolveChannelname(updatedSlots.channelname.value, headers);

			// if there are no similar channels
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
				// if there are multiple channels with similar names
			} else {
				// store the similar channels in sessions Attributes and ask the user for a choice
				sessionAttributes.similarChannels = channels;
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
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const DeniedRenameChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'RenameChannelIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('CHANNEL_DETAILS.SET_DESCRIPTION_DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const RenameChannelIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'RenameChannelIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
              && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;
			const { attributesManager } = handlerInput;
			const sessionAttributes = attributesManager.getSessionAttributes() || {};

			// const channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
			const newname = handlerInput.requestEnvelope.request.intent.slots.newname.value;

			const headers = await login(accessToken);
			const speechText = await renameChannel(sessionAttributes.channel, newname, headers);

			delete sessionAttributes.similarChannels;
			delete sessionAttributes.channel;

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				if (speechText.params && speechText.params.success) {
					const data = {
						title: handlerInput.translate(speechText.key, speechText.params),
						message: '',
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();

				} else {
					const data = {
						title: handlerInput.translate('CHANNEL_DETAILS.ERROR'),
						message: '',
					};

					return handlerInput.jrb
						.speak(speechText)
						.speak(repromptText)
						.reprompt(repromptText)
						.addDirective(titleMessageTemplate(data))
						.getResponse();
				}

			} else {

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();

			}

		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	StartedRenameChannelIntentHandler,
	InProgressRenameChannelIntentHandler,
	DeniedRenameChannelIntentHandler,
	RenameChannelIntentHandler,
};