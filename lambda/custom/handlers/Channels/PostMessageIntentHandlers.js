const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, postMessage } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');

const StartedPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
        handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		// if a choice is present and has a value, it means the user has already made a choice on which channel to choose from
		if (updatedSlots.choice && updatedSlots.choice.value) {

			// get the array of channels which the user was asked for
			const channels = sessionAttributes.similarChannels.trim().split(' ');

			// if the user selects an invalid choice then ask for an appropriate choice
			if (Number(updatedSlots.choice.value) === 0 || Number(updatedSlots.choice.value) > channels.length) {
				const speechText = ri('POST_MESSAGE.ASK_CHOICE', { choice_limit: channels.length, channels_list: channels.join(', ') });
				const slotName = 'choice';
				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}

			// if everything is correct then proceed to ask for confirmation
			updatedSlots.messagechannel.value = channels[Number(updatedSlots.choice.value) - 1];
			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();
		}

		// is the user has told the channel name to alexa
		if (updatedSlots.messagechannel.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar channelnames
			const channels = await resolveChannelname(updatedSlots.messagechannel.value, headers);

			// if there are no similar channels
			if (channels.length === 0) {
				const speechText = ri('POST_MESSAGE.NO_CHANNEL', { channel_name: updatedSlots.messagechannel.value });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
				// if there's only one similar channel, then change the slot value to the matching channel
			} else if (channels.length === 1) {
				updatedSlots.messagechannel.value = channels[0].name;
				// if there are multiple channels with similar names
			} else {
				// store the similar channels in sessions Attributes and ask the user for a choice
				sessionAttributes.similarChannels = '';
				for (let i = 0; i < channels.length; i++) {
					sessionAttributes.similarChannels += `${ channels[i].name } `;
				}

				const channel_names = sessionAttributes.similarChannels.split(' ').join(', ');
				const speechText = ri('POST_MESSAGE.SIMILAR_CHANNELS', { channel_names });
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

const DeniedPostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent' &&
          handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
          handlerInput.requestEnvelope.request.intent.confirmationStatus === 'DENIED';
	},
	handle(handlerInput) {
		const speechText = ri('POST_MESSAGE.DENIED');
		const repromptText = ri('GENERIC_REPROMPT');

		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.getResponse();
	},
};

const PostMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
              && handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
			// const channelNameData = getStaticAndDynamicSlotValuesFromSlot(handlerInput.requestEnvelope.request.intent.slots.messagechannel);
			// const channelName = replaceWhitespacesFunc(channelNameData);
			const channelName = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;

			const headers = await login(accessToken);
			const speechText = await postMessage(channelName, message, headers);
			const repromptText = ri('GENERIC_REPROMPT');
			const data = {
				title: `Message sent to #${ channelName }`,
				message,
			};

			if (supportsAPL(handlerInput)) {

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective(titleMessageBoxTemplate(data))
					.getResponse();

			} else {

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
					.getResponse();

			}

		} catch (error) {
			console.error(error);
		}
	},
};


module.exports = {
	StartedPostMessageIntentHandler,
	InProgressPostMessageIntentHandler,
	DeniedPostMessageIntentHandler,
	PostMessageIntentHandler,
};
