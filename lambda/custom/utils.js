const { ri } = require('@jargon/alexa-skill-sdk');
const { login, resolveChannelname, resolveUsername, getUsersWithRolesFromRoom } = require('./helperFunctions');

// APL Compaitability Checker Function
const supportsAPL = (handlerInput) => {
	const { supportedInterfaces } = handlerInput.requestEnvelope.context.System.device;
	return !!supportedInterfaces['Alexa.Presentation.APL'];
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

const slotValue = (slot) => {
	let { value } = slot;
	const resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
	if (resolution && resolution.status.code === 'ER_SUCCESS_MATCH') {
		const resolutionValue = resolution.values[0].value;
		value = resolutionValue.name;
	}
	return value;
};

const getStaticAndDynamicSlotValuesFromSlot = (slot) => {

	const result = {
		name: slot.name,
		value: slot.value,
	};

	if (((slot.resolutions || {}).resolutionsPerAuthority || [])[0] || {}) {
		slot.resolutions.resolutionsPerAuthority.forEach((authority) => {
			const slotValue = {
				authority: authority.authority,
				statusCode: authority.status.code,
				synonym: slot.value || undefined,
				resolvedValues: slot.value,
			};
			if (authority.values && authority.values.length > 0) {
				slotValue.resolvedValues = [];

				authority.values.forEach((value) => {
					slotValue.resolvedValues.push(value);
				});

			}

			if (authority.authority.includes('amzn1.er-authority.echo-sdk.dynamic')) {
				result.dynamic = slotValue;
			} else {
				result.static = slotValue;
			}
		});
	}

	if (result.hasOwnProperty('dynamic') && result.dynamic.statusCode === 'ER_SUCCESS_MATCH') {
		return result.dynamic.resolvedValues[0].value.name;
	} else if (result.hasOwnProperty('static') && result.static.statusCode === 'ER_SUCCESS_MATCH') {
		return result.static.resolvedValues[0].value.name;
	} else {
		return result.value;
	}
};

// returns a random property from an object
const randomProperty = function(obj) {
	const keys = Object.keys(obj);
	return obj[keys[keys.length * Math.random() << 0]];
};

const resolveChannel = async (handlerInput, channelSlotname, choiceSlotname) => {
	const currentIntent = handlerInput.requestEnvelope.request.intent;
	const updatedSlots = currentIntent.slots;

	const { attributesManager } = handlerInput;
	const sessionAttributes = attributesManager.getSessionAttributes() || {};

	// if a choice is present and has a value, it means the user has already made a choice on which channel to choose from
	if (!sessionAttributes.channel && updatedSlots[choiceSlotname] && updatedSlots[choiceSlotname].value) {

		// get the array of channels which the user was asked for
		const channels = sessionAttributes.similarChannels;

		// if the user selects an invalid choice then ask for an appropriate choice
		if (Number(updatedSlots[choiceSlotname].value) === 0 || Number(updatedSlots[choiceSlotname].value) > channels.length) {
			let channels_list = '';
			for (const { name } of channels) {
				channels_list += `${ name }, `;
			}
			const speechText = ri('RESOLVE_CHANNEL.ASK_CHOICE', { choice_limit: channels.length, channels_list });
			const slotName = choiceSlotname;
			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}

		// if everything is correct then proceed to ask for confirmation
		const channelDetails = channels[Number(updatedSlots[choiceSlotname].value) - 1];
		updatedSlots[channelSlotname].value = channelDetails.name;
		sessionAttributes.channel = channelDetails;
		delete updatedSlots[choiceSlotname].value;
		return handlerInput.responseBuilder
			.addDelegateDirective(currentIntent)
			.getResponse();
	}

	// if the user has told the channel name to alexa
	if (updatedSlots[channelSlotname].value && !sessionAttributes.channel) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const headers = await login(accessToken);

		// get the array of similar channelnames
		const channels = await resolveChannelname(updatedSlots[channelSlotname].value, headers);

		// if there are no similar channels
		if (channels.length === 0) {
			const speechText = ri('RESOLVE_CHANNEL.NO_CHANNEL', { channel_name: updatedSlots[channelSlotname].value });
			const repromptText = ri('GENERIC_REPROMPT');
			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
			// if there's only one similar channel, then change the slot value to the matching channel
		} else if (channels.length === 1) {
			updatedSlots[channelSlotname].value = channels[0].name;
			sessionAttributes.channel = channels[0];
			// if there are multiple channels with similar names
		} else {
			// store the similar channels in sessions Attributes and ask the user for a choice
			sessionAttributes.similarChannels = channels;
			let channel_names = '';
			for (const { name } of channels) {
				channel_names += `${ name }, `;
			}

			const speechText = ri('RESOLVE_CHANNEL.SIMILAR_CHANNELS', { channel_names });
			const slotName = choiceSlotname;


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}
	}

	return handlerInput.responseBuilder
		.addDelegateDirective(currentIntent)
		.getResponse();
};

const resolveUser = async (handlerInput, userSlotname, choiceSlotname) => {
	const updatedIntent = handlerInput.requestEnvelope.request.intent;
	const updatedSlots = updatedIntent.slots;

	const { attributesManager } = handlerInput;
	const sessionAttributes = attributesManager.getSessionAttributes() || {};

	if (!sessionAttributes.user && updatedSlots[choiceSlotname] && updatedSlots[choiceSlotname].value) {
		// get the array of users which the user was asked for
		const users = sessionAttributes.similarusers;

		// if the user selects an invalid choice then ask for an appropriate choice
		if (Number(updatedSlots[choiceSlotname].value) === 0 || Number(updatedSlots[choiceSlotname].value) > users.length) {
			let users_list = '';
			for (const { name } of users) {
				users_list += `${ name }, `;
			}
			const speechText = ri('RESOLVE_USERNAME.ASK_CHOICE', { choice_limit: users.length, users_list });
			const slotName = choiceSlotname;
			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}

		// if everything is correct then proceed to ask for confirmation
		const userDetails = users[Number(updatedSlots[choiceSlotname].value) - 1];
		updatedSlots[userSlotname].value = userDetails.name;
		sessionAttributes.user = userDetails;
		delete updatedSlots[choiceSlotname].value;
		return handlerInput.responseBuilder
			.addDelegateDirective(updatedIntent)
			.getResponse();
	}

	if (!sessionAttributes.user && updatedSlots[userSlotname].value) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const headers = await login(accessToken);

		// get the array of similar usernames
		const users = await resolveUsername(updatedSlots[userSlotname].value, headers);

		if (users.length === 0) {
			const speechText = ri('RESOLVE_USERNAME.NO_USER', { username: updatedSlots[userSlotname].value });
			const repromptText = ri('GENERIC_REPROMPT');
			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
			// if there's only one similar username, then change the slot value to the matching username
		} else if (users.length === 1) {
			updatedSlots[userSlotname].value = users[0].name;
			sessionAttributes.user = users[0];
		} else {
			sessionAttributes.similarusers = users;
			let user_names = '';
			for (const { name } of users) {
				user_names += `${ name }, `;
			}

			const speechText = ri('RESOLVE_USERNAME.SIMILAR_USERS', { user_names });
			const slotName = choiceSlotname;


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}
	}

	return handlerInput.responseBuilder
		.addDelegateDirective(updatedIntent)
		.getResponse();
};

const resolveUserWithRole = async (handlerInput, userSlotname, choiceSlotname, role) => {
	const updatedIntent = handlerInput.requestEnvelope.request.intent;
	const updatedSlots = updatedIntent.slots;

	const { attributesManager } = handlerInput;
	const sessionAttributes = attributesManager.getSessionAttributes() || {};

	if (!sessionAttributes.user && updatedSlots[choiceSlotname] && updatedSlots[choiceSlotname].value) {
		// get the array of users which the user was asked for
		const users = sessionAttributes.similarusers;

		// if the user selects an invalid choice then ask for an appropriate choice
		if (Number(updatedSlots[choiceSlotname].value) === 0 || Number(updatedSlots[choiceSlotname].value) > users.length) {
			let users_list = '';
			for (const { username } of users) {
				users_list += `${ username }, `;
			}
			const speechText = ri('RESOLVE_USERNAME.ASK_CHOICE', { choice_limit: users.length, users_list });
			const slotName = choiceSlotname;
			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}

		// if everything is correct then proceed to ask for confirmation
		const userDetails = users[Number(updatedSlots[choiceSlotname].value) - 1];
		updatedSlots[userSlotname].value = userDetails.username;
		sessionAttributes.user = userDetails;
		delete updatedSlots[choiceSlotname].value;
		return handlerInput.responseBuilder
			.addDelegateDirective(updatedIntent)
			.getResponse();
	}

	if (!sessionAttributes.user && updatedSlots[userSlotname].value) {
		const {
			accessToken,
		} = handlerInput.requestEnvelope.context.System.user;

		const headers = await login(accessToken);

		// get the array of similar usernames
		const users = await getUsersWithRolesFromRoom(updatedSlots[userSlotname].value, sessionAttributes.channel.id, sessionAttributes.channel.type, role, headers);

		if (users.length === 0) {
			let speechText;

			if (role === 'leader') {
				speechText = ri('ROOM_ROLES.USER_NOT_LEADER', { username: updatedSlots[userSlotname].value, roomname: sessionAttributes.channel.name });
			} else if (role === 'owner') {
				speechText = ri('ROOM_ROLES.USER_NOT_OWNER', { username: updatedSlots[userSlotname].value, roomname: sessionAttributes.channel.name });
			} else if (role === 'moderator') {
				speechText = ri('ROOM_ROLES.USER_NOT_MODERATOR', { username: updatedSlots[userSlotname].value, roomname: sessionAttributes.channel.name });
			}

			const repromptText = ri('GENERIC_REPROMPT');
			return handlerInput.jrb
				.speak(speechText)
				.speak(repromptText)
				.reprompt(repromptText)
				.getResponse();
			// if there's only one similar channel, then change the slot value to the matching channel
		} else if (users.length === 1) {
			updatedSlots[userSlotname].value = users[0].username;
			sessionAttributes.user = users[0];
		} else {
			sessionAttributes.similarusers = users;
			let user_names = '';
			for (const { username } of users) {
				user_names += `${ username }, `;
			}

			const speechText = ri('RESOLVE_USERNAME.SIMILAR_USERS', { user_names });
			const slotName = choiceSlotname;


			return handlerInput.jrb
				.speak(speechText)
				.reprompt(speechText)
				.addElicitSlotDirective(slotName)
				.getResponse();
		}
	}

	return handlerInput.responseBuilder
		.addDelegateDirective(updatedIntent)
		.getResponse();
};

module.exports = {
	supportsAPL,
	supportsDisplay,
	slotValue,
	randomProperty,
	getStaticAndDynamicSlotValuesFromSlot,
	resolveChannel,
	resolveUser,
	resolveUserWithRole,
};
