const layout = require('../layouts/errorMessageLayout.json');
const APLconfig = require('../APLconfig');

const template = ({ errorTitle, errorMessage }) => ({
	type: 'Alexa.Presentation.APL.RenderDocument',
	version: '1.0',
	document: layout,
	datasources: {
		AuthorisationErrorPageData: {
			type: 'object',
			objectId: 'rcAuthorisation',
			backgroundImage: {
				contentDescription: null,
				smallSourceUrl: null,
				largeSourceUrl: null,
				sources: [
					{
						url: APLconfig.bgHelp,
						size: 'small',
						widthPixels: 0,
						heightPixels: 0,
					},
					{
						url: APLconfig.bgHelp,
						size: 'large',
						widthPixels: 0,
						heightPixels: 0,
					},
				],
			},
			textContent: {
				primaryText: {
					type: 'PlainText',
					text: errorTitle,
				},
				secondaryText: {
					type: 'PlainText',
					text: errorMessage,
				},
			},
			logoUrl: APLconfig.logoUrl,
		},
	},
});

module.exports = template;
