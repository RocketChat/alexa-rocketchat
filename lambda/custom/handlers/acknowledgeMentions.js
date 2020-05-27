const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri
} = Jargon;
const helperFunctions = require('../helperFunctions')

const AcknowledgeMentionsIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AcknowledgeMentionsIntent'
    },
    async handle(handlerInput) {
        try {
            const {
                accessToken
            } = handlerInput.requestEnvelope.context.System.user;

            const headers = await helperFunctions.login(accessToken);

            let channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
            const channel = await helperFunctions.resolveChannelname(channelName, headers, true)

            let count
            if (channel.type == 'c'){
				count = await helperFunctions.getUnreadMentionsCountChannel(channel.name, headers);
			} else {
				count = await helperFunctions.getUnreadMentionsCountGroup(channel.id, headers);
            }
            const speechText = await helperFunctions.acknowledgeUnreadMentions(channel.id, channel.name, count, headers);
            let repromptText = ri('GENERIC_REPROMPT');

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
    AcknowledgeMentionsIntentHandler   
}