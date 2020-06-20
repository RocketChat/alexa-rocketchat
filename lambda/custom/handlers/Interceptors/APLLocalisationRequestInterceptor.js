const { randomProperty } = require('../../utils');

const APLLocalisationRequestInterceptor = {
	process(handlerInput) {
		// this is a custom translate function which is added to the handlerInput object
		handlerInput.translate = (input, data = {}) => {
			try {
				// import the resource specific locale file
				const resourceFilePath = `../../resources/${ handlerInput.requestEnvelope.request.locale }.json`;
				// eslint-disable-next-line no-unused-vars
				const resource = require(resourceFilePath);

				// get the value of the requested input key
				let output = (eval(`resource.${ input }`));
				if (!output) {
					return 'invalid';
				}

				// if there are multiple values (i.e. if it's an object), get a random value
				if (output && typeof(output) === 'object') {
					output = randomProperty(output);
				}

				// replace the parameters in the value with input data
				let key; let value;
				for ([key, value] of Object.entries(data)) {
					const re = new RegExp(`{${ key }}`, 'g');
					output = output.replace(re, value);
				}
				return output;

			} catch (err) {
				console.log(err);
				return 'invalid';
			}
		};
	},
};

module.exports = APLLocalisationRequestInterceptor;
