const layout = require('../layouts/titleMessageBoxLayout.json.json');
const APLconfig = require('../APLconfig');

const template = ({ title, message }) => ({
	type: 'Alexa.Presentation.APL.RenderDocument',
	version: '1.0',
	document: layout,
	datasources: {

		PostMessageData: {
			type: 'object',
			objectId: 'rcPostMessage',
			backgroundImage: {
				contentDescription: null,
				smallSourceUrl: null,
				largeSourceUrl: null,
				sources: [
					{
						url: APLconfig.bg1,
						size: 'small',
						widthPixels: 0,
						heightPixels: 0,
					},
					{
						url: APLconfig.bg1,
						size: 'large',
						widthPixels: 0,
						heightPixels: 0,
					},
				],
			},
			textContent: {
				title: {
					type: 'PlainText',
					text: title,
				},
				message: {
					type: 'PlainText',
					text: message,
				},
			},
			logoUrl: APLconfig.logoUrl,
		},

	},
});

module.exports = template;
