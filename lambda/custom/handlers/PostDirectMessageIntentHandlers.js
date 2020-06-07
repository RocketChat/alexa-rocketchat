const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveUsername, createDMSession, postDirectMessage } = require('../helperFunctions');


const StartedPostDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
		handlerInput.requestEnvelope.request.intent.name === 'PostDirectMessageIntent' &&
		handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressPostDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostDirectMessageIntent' &&
			handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
			handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		const updatedSlots = currentIntent.slots;

		const { attributesManager } = handlerInput;
		const sessionAttributes = attributesManager.getSessionAttributes() || {};

		// if the user has already made a choice for the username
		if (updatedSlots.choice && updatedSlots.choice.value) {

			// get the array of similar usernames which was stored in session attributes
			const directs = sessionAttributes.similarDirects.trim().split(' ');

			// if user makes an invalid choice, ask for an appropriate choice
			if (Number(updatedSlots.choice.value) === 0 || Number(updatedSlots.choice.value) > directs.length) {
				const similar_directs = directs.join(', ');
				const speechText = ri('POST_MESSAGE.ASK_CHOICE', { choice_limit: directs.length, channels_list: similar_directs });
				const slotName = 'choice';
				return handlerInput.jrb
					.speak(speechText)
					.reprompt(speechText)
					.addElicitSlotDirective(slotName)
					.getResponse();
			}

			updatedSlots.directmessageusername.value = directs[Number(updatedSlots.choice.value) - 1];
			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();
		}

		// if the user has told username to alexa
		if (updatedSlots.directmessageusername.value) {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);

			// get the array of similar usernames
			const channels = await resolveUsername(updatedSlots.directmessageusername.value, headers);

			// if there are no matching usernames
			if (channels.length === 0) {
				const speechText = ri('POST_MESSAGE.NO_USER', { username: updatedSlots.directmessageusername.value });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
			// if there's only one matching username, update the slot value to the matching username
			} else if (channels.length === 1) {
				updatedSlots.directmessageusername.value = channels[0].name;
			// if there are multiple similar usernames
			} else {
				// store the similar usernames in sessions attributes
				sessionAttributes.similarDirects = '';
				for (let i = 0; i < channels.length; i++) {
					sessionAttributes.similarDirects += `${ channels[i].name } `;
				}
				const slotName = 'choice';
				const similar_directs = sessionAttributes.similarDirects.split(' ').join(', ');

				// ask the user for a correct choice
				const speechText = ri('POST_MESSAGE.SIMILAR_USERS', { usernames: similar_directs });

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

const DeniedPostDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
		handlerInput.requestEnvelope.request.intent.name === 'PostDirectMessageIntent' &&
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

const PostDirectMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'PostDirectMessageIntent'
			&& handlerInput.requestEnvelope.request.dialogState === 'COMPLETED'
			&& handlerInput.requestEnvelope.request.intent.confirmationStatus === 'CONFIRMED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const message = handlerInput.requestEnvelope.request.intent.slots.directmessage.value;
			// const userNameData = handlerInput.requestEnvelope.request.intent.slots.directmessageusername.value;
			// const userName = replaceWhitespacesDots(userNameData);
			const userName = handlerInput.requestEnvelope.request.intent.slots.directmessageusername.value;

			const headers = await login(accessToken);
			const roomid = await createDMSession(userName, headers);
			const speechText = await postDirectMessage(message, roomid, headers);
			const repromptText = ri('GENERIC_REPROMPT');


			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.withSimpleCard(ri('POST_MESSAGE.CARD_TITLE'), speechText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	StartedPostDirectMessageIntentHandler,
	InProgressPostDirectMessageIntentHandler,
	DeniedPostDirectMessageIntentHandler,
	PostDirectMessageIntentHandler,
};
