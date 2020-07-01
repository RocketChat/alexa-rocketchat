const { randomKeyValue } = require('../../utils');

const HintGenerationResponseInterceptor = {
	process(handlerInput) {
		try {
			// load the resources
			const resourceFilePath = `../../resources/${ handlerInput.requestEnvelope.request.locale }.json`;
			const resource = require(resourceFilePath);

			// get the response string
			const response = handlerInput.responseBuilder.getResponse();

			// if the response includes the generic reprompt and a 50% probability check if the hint should be given
			if (response.outputSpeech && response.outputSpeech.ssml.includes(resource.GENERIC_REPROMPT) && Math.random() >= 0.5) {
				// get a random hint for an intent, which is different from the intent just invoked
				let hint = randomKeyValue(resource.HINTS);
				while (handlerInput.requestEnvelope.request.intent.name === hint.key) {
					hint = randomKeyValue(resource.HINTS);
				}
				// add the hint to speech output
				response.outputSpeech.ssml = response.outputSpeech.ssml.replace(resource.GENERIC_REPROMPT, `${ resource.GENERIC_REPROMPT }. ${ resource.HINT_TRANSITION }, ${ hint.value }`);
			}
		} catch (err) {
			// No change if an error occurs.
			console.log(err);
		}
	},
};

module.exports = { HintGenerationResponseInterceptor };
