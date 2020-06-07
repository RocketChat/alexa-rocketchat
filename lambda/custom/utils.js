// APL Compaitability Checker Function
const supportsAPL = (handlerInput) => {
	const { supportedInterfaces } = handlerInput.requestEnvelope.context.System.device;
	const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
	return aplInterface != null && aplInterface !== undefined;
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
