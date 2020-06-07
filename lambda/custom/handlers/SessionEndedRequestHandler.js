const { customLog } = require('../helperFunctions');

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${ handlerInput.requestEnvelope.request.reason }`);
		customLog({ session_ended_reason: handlerInput.requestEnvelope.request.reason });

		return handlerInput.responseBuilder
			.addDirective({
				type: 'Dialog.UpdateDynamicEntities',
				updateBehavior: 'CLEAR',
			})
			.getResponse();
	},
};

module.exports = {
	SessionEndedRequestHandler,
};
