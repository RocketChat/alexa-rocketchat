const layout = require('../layouts/titleMessageLayout.json');

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
						url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
						size: 'small',
						widthPixels: 0,
						heightPixels: 0,
					},
					{
						url: 'https://user-images.githubusercontent.com/41849970/60673516-82021100-9e95-11e9-8a9c-cc68cfe5acf1.png',
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
			logoUrl: 'https://github.com/RocketChat/Rocket.Chat.Artwork/raw/master/Logos/icon-circle-1024.png',
		},

	},
});

module.exports = template;
