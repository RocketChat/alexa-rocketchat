const layout = require('../layouts/burgerLayout.json');
const APLconfig = require('../APLconfig');

const template = ({ top, middle, bottom }) => ({
	type: 'Alexa.Presentation.APL.RenderDocument',
	version: '1.0',
	document: layout,
	datasources: {
		DeleteChannelPageData: {
			type: 'object',
			objectId: 'rcDeleteChannel',
			backgroundImage: {
				contentDescription: null,
				smallSourceUrl: null,
				largeSourceUrl: null,
				sources: [
					{
						url: APLconfig.bg2,
						size: 'small',
						widthPixels: 0,
						heightPixels: 0,
					},
					{
						url: APLconfig.bg2,
						size: 'large',
						widthPixels: 0,
						heightPixels: 0,
					},
				],
			},
			textContent: {
				placeholder: {
					type: 'PlainText',
					text: top,
				},
				channelname: {
					type: 'PlainText',
					text: middle,
				},
				successful: {
					type: 'PlainText',
					text: bottom,
				},
			},
			logoUrl: APLconfig.logoUrl,
		},

	},
});

module.exports = template;
