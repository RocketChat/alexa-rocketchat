const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveDiscussion, postMessage } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');

const StartedPostDiscussionMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostDiscussionMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'STARTED';
	},
	handle(handlerInput) {
		const currentIntent = handlerInput.requestEnvelope.request.intent;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	},
};

const InProgressPostDiscussionMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
        handlerInput.requestEnvelope.request.intent.name === 'PostDiscussionMessageIntent' &&
        handlerInput.requestEnvelope.request.dialogState === 'IN_PROGRESS' &&
        handlerInput.requestEnvelope.request.intent.confirmationStatus !== 'DENIED';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;


			const currentIntent = handlerInput.requestEnvelope.request.intent;
			const { attributesManager } = handlerInput;
			const sessionAttributes = attributesManager.getSessionAttributes() || {};

			const headers = await login(accessToken);

			const discussionName = handlerInput.requestEnvelope.request.intent.slots.discussionname.value;

			const discussionDetails = await resolveDiscussion (discussionName, headers);
			if (!discussionDetails) {
				const speechText = ri('POST_MESSAGE.NO_ACTIVE_DISCUSSION', { discussionname: discussionName });
				const repromptText = ri('GENERIC_REPROMPT');
				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.getResponse();
			}

			// fname is the display name of a discussion
			currentIntent.slots.discussionname.value = discussionDetails.fname;

			sessionAttributes.discussionDetails = discussionDetails;

			return handlerInput.responseBuilder
				.addDelegateDirective(currentIntent)
				.getResponse();


		} catch (err) {
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

const DeniedPostDiscussionMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'PostDiscussionMessageIntent' &&
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

const PostDiscussionMessageIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
              handlerInput.requestEnvelope.request.intent.name === 'PostDiscussionMessageIntent'
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

			const message = handlerInput.requestEnvelope.request.intent.slots.discussionmessage.value;
			// name of the discussion is a uniquely generated name that can be used a channelnames
			const discussionName = sessionAttributes.discussionDetails.name;

			const headers = await login(accessToken);
			const speechText = await postMessage(discussionName, message, headers);
			const repromptText = ri('GENERIC_REPROMPT');
			const data = {
				title: handlerInput.translate('POST_MESSAGE.APL_SUCCESS', { channelName: sessionAttributes.discussionDetails.fname }),
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
	StartedPostDiscussionMessageIntentHandler,
	InProgressPostDiscussionMessageIntentHandler,
	DeniedPostDiscussionMessageIntentHandler,
	PostDiscussionMessageIntentHandler,
};
