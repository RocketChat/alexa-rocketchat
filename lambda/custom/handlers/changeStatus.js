const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri
} = Jargon;
const {setStatus, login} = require('../helperFunctions')

const ChangeStatusIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'ChangeStatusIntent'
    },
    async handle(handlerInput) {
        try {
            const {
                accessToken
            } = handlerInput.requestEnvelope.context.System.user;

            const headers = await login(accessToken);
            console.log(headers)

            let statusMessage = handlerInput.requestEnvelope.request.intent.slots.statusmessage.value;
            const speechText = await setStatus(statusMessage, headers)

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
    ChangeStatusIntentHandler   
} 