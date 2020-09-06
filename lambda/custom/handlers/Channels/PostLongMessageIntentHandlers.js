const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname } = require('../../helperFunctions');


const StartedPostLongMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostLongMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressPostLongMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PostLongMessageIntent' &&
              handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS';
	},
	async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		// if channel is confirmed then continue
		if (sessionAttributes.channelConfirm) {
			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();
		}

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
			updatedSlots.channelname.value = channels[Number(updatedSlots.choice.value) - 1];
			sessionAttributes.channelConfirm = true;
			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();
		}

		// if the user has told the channel name to alexa
		if (updatedSlots.channelname.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar channelnames
			const channels = await resolveChannelname(updatedSlots.channelname.value, headers);

			// if there are no similar channels
			if (channels.length === 0) {
				const speechText = ri('POST_MESSAGE.NO_CHANNEL', { channel_name: updatedSlots.channelname.value });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
				// if there's only one similar channel, then change the slot value to the matching channel
			} else if (channels.length === 1) {
				updatedSlots.channelname.value = channels[0].name;
				sessionAttributes.channelConfirm = true;
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

const PostLongMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PostLongMessageIntent'
              && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		try {
			const message = handlerInput.requestEnvelope.request.intent.slots.longmessage.value;
			if (sessionAttributes.hasOwnProperty('message')) {
				sessionAttributes.message += `, ${ message }`;
			} else {
				sessionAttributes.message = message;
			}

			sessionAttributes.postLongMessageIntentOnProgress = true;

			if (!sessionAttributes.hasOwnProperty('channelName')) {
				// const channelNameData = helperFunctions.getStaticAndDynamicSlotValuesFromSlot(handlerInput.requestEnvelope.request.intent.slots.channelname);
				// const channelName = helperFunctions.replaceWhitespacesFunc(channelNameData);
				// sessionAttributes.channelName = channelName;
				sessionAttributes.channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
			}

			return handlerInput.jrb
				.speak(ri('POST_MESSAGE.ASK_MORE'))
				.reprompt(ri('POST_MESSAGE.ASK_MORE'))
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), ri('POST_MESSAGE.ASK_MORE'))
				.getResponse();

		} catch (error) {
			const speechText = ri('SOMETHING_WENT_WRONG');
			const repromptText = ri('GENERIC_REPROMPT');

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
		}
	},
};

module.exports = {
	StartedPostLongMessageIntentHandler,
	InProgressPostLongMessageIntentHandler,
	PostLongMessageIntentHandler,
};
