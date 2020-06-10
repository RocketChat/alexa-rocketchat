const layout = require('../layouts/homePageLayout.json');
const APLconfig = require('../APLconfig');

const template = ({ title, hint }) => ({
	type: 'Alexa.Presentation.APL.RenderDocument',
	version: '1.0',
	document: layout,
	datasources: {
		RCHomePageData: {
			type: 'object',
			objectId: 'rcHomePage',
			backgroundImage: {
				contentDescription: null,
				smallSourceUrl: null,
				largeSourceUrl: null,
				sources: [
					{
						url: APLconfig.bg4,
						size: 'small',
						widthPixels: 0,
						heightPixels: 0,
					},
					{
						url: APLconfig.bg4,
						size: 'large',
						widthPixels: 0,
						heightPixels: 0,
					},
				],
			},
			textContent: {
				primaryText: {
					type: 'PlainText',
					text: title,
				},
			},
			logoUrl: APLconfig.logoUrl,
			hintText: hint,
		},
	},
});

module.exports = template;
