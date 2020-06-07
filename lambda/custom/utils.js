// APL Compaitability Checker Function
const supportsAPL = (handlerInput) => {
	const { supportedInterfaces } = handlerInput.requestEnvelope.context.System.device;
	return !!supportedInterfaces['Alexa.Presentation.APL'];
};

const supportsDisplay = (handlerInput) => {
	const hasDisplay =
		handlerInput.requestEnvelope.context &&
		handlerInput.requestEnvelope.context.System &&
		handlerInput.requestEnvelope.context.System.device &&
		handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
		handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
	return hasDisplay;
};

module.exports = {
	supportsAPL,
	supportsDisplay,
};
