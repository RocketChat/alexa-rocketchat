const { ri } = require('@jargon/alexa-skill-sdk');
const { slotValue } = require('../helperFunctions');

// Permissions for Notifications
const PERMISSIONS = {
	NOTIFICATION_PERMISSION: 'alexa::devices:all:notifications:write',
};

const ProactiveEventHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'AlexaSkillEvent.ProactiveSubscriptionChanged';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		if (handlerInput.requestEnvelope.request.hasOwnProperty('body')) {
			if (attributes.hasOwnProperty('optForNotifications')) {
				attributes.optForNotifications = !attributes.optForNotifications;
			} else {
				attributes.optForNotifications = true;
			}
		} else {
			attributes.optForNotifications = false;
		}

		handlerInput.attributesManager.setPersistentAttributes(attributes);
		await handlerInput.attributesManager.savePersistentAttributes();
	},
};

const ChangeNotificationSettingsIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'ChangeNotificationSettingsIntent';
	},
	async handle(handlerInput) {
		const { attributesManager } = handlerInput;
		const attributes = await attributesManager.getPersistentAttributes() || {};

		const notificationsFor = slotValue(handlerInput.requestEnvelope.request.intent.slots.notificationsFor);
		let speechText = '';
		const repromptText = ri('GENERIC_REPROMPT');

		if (attributes.hasOwnProperty('optForNotifications') && attributes.hasOwnProperty('notificationsSettings')) {
			if (attributes.optForNotifications === true) {
				if (attributes.notificationsSettings === notificationsFor) {
					if (notificationsFor === 'userMentions') {
						speechText = ri('NOTIFICATION_SETTINGS.ERROR_ALREADY_USERMENTIONS');
					} else {
						speechText = ri('NOTIFICATION_SETTINGS.ERROR_ALREADY_UNREADS');
					}
				} else {
					attributes.notificationsSettings = notificationsFor;
					if (notificationsFor === 'userMentions') {
						speechText = ri('NOTIFICATION_SETTINGS.SUCCESS_USERMENTIONS');
					} else {
						speechText = ri('NOTIFICATION_SETTINGS.SUCCESS_UNREADS');
					}
					handlerInput.attributesManager.setPersistentAttributes(attributes);
					await handlerInput.attributesManager.savePersistentAttributes();
				}
			} else {
				speechText = ri('NOTIFICATION_SETTINGS.ERROR_TURNED_OFF');
				return handlerInput.jrb
					.speak(speechText)
					.withAskForPermissionsConsentCard([PERMISSIONS.NOTIFICATION_PERMISSION])
					.getResponse();
			}
		} else {
			speechText = ri('NOTIFICATION_SETTINGS.ERROR');
			return handlerInput.jrb
				.speak(speechText)
				.withAskForPermissionsConsentCard([PERMISSIONS.NOTIFICATION_PERMISSION])
				.getResponse();
		}
		return handlerInput.jrb
			.speak(speechText)
			.speak(repromptText)
			.reprompt(repromptText)
			.withSimpleCard(ri('NOTIFICATION_SETTINGS.CARD_TITLE'), speechText)
			.getResponse();
	},
};

module.exports = {
	ProactiveEventHandler,
	ChangeNotificationSettingsIntentHandler,
};
