const supportsAPL = (handlerInput) => {
	const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
	const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
	return aplInterface != null && aplInterface != undefined;
}

module.exports = {
    supportsAPL
}