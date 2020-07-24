const { ri } = require('@jargon/alexa-skill-sdk');
const { resolveChannelname, login, getUnreadCounter, channelUnreadMessages, getGroupUnreadCounter, groupUnreadMessages } = require('../../helperFunctions');
const { supportsAPL } = require('../../utils');
const titleMessageBoxTemplate = require('../../APL/templates/titleMessageBoxTemplate');


const GetUnreadMessagesIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ReadUnreadsIntent';
	},
	async handle(handlerInput) {
		try {
			const {
				accessToken,
			} = handlerInput.requestEnvelope.context.System.user;

			const headers = await login(accessToken);
			const response = await resolveChannelname(handlerInput.requestEnvelope.request.intent.slots.readunreadschannel.value, headers, true);
			const room = response[0];
			let speechText;
			if (room.type === 'c') {
				const unreadCount = await getUnreadCounter(room.name, headers);
				speechText = await channelUnreadMessages(room.name, unreadCount, headers);
			} else {
				const unreadCount = await getGroupUnreadCounter(room.id, headers);
				speechText = await groupUnreadMessages(room.name, room.id, unreadCount, headers);
			}

			const repromptText = ri('GENERIC_REPROMPT');

			if (supportsAPL(handlerInput)) {
				const data = {
					title: room.name,
					message: handlerInput.translate(speechText.key, speechText.params),
				};

				return handlerInput.jrb
					.speak(speechText)
					.speak(repromptText)
					.reprompt(repromptText)
					.addDirective(titleMessageBoxTemplate(data))
					.getResponse();
			}

			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
		} catch (error) {
			console.error(error);
		}
	},
};

module.exports = {
	GetUnreadMessagesIntentHandler,
};
