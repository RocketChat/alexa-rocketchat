const axios = require('axios');
const apiEndpoints = require('./apiEndpoints');
const envVariables = require('./config');
const stringSimilar = require('string-similarity');

const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri,
} = Jargon;

const removeWhitespace = require('remove-whitespace');
const emojiTranslate = require('moji-translate');
const { serverurl } = require('./config');

// Server Credentials. Follow readme to set them up.
const {
	oauthServiceName,
} = envVariables;

const cleanMessage = (string) => {

	// :([a-z_]+): => regex for emoji :emoji:
	// (&[#0-9A-Za-z]*;) => regex for special character encodings &#ab3;
	// ((https?|ftp):\/\/[\.[a-zA-Z0-9\/\-]+) => regex for url

	const combined_regex = new RegExp(':([a-z_]+):|(&[#0-9A-Za-z]*;)|((https?|ftp):\/\/[.[a-zA-Z0-9\/-]+)|[^ .,A-Za-z0-9\\n]', 'g');
	return string.replace(combined_regex, '');
};

const removeEmojis = (string) => {
	const exp = ':([a-z_]+):';
	const re = new RegExp(exp, 'g');
	return string.replace(re, '');
};

// Axios Functions

const login = async (accessToken) =>
	await axios
		.post(apiEndpoints.loginUrl, {
			serviceName: oauthServiceName,
			accessToken,
			expiresIn: 200,
		})
		.then((res) => res.data)
		.then((res) => {
			const headers = {
				'X-Auth-Token': res.data.authToken,
				'X-User-Id': res.data.userId,
			};
			return headers;
		})
		.catch((err) => {
			console.log(err);
		});

const getUserName = async (headers) =>
	await axios
		.get(`${ apiEndpoints.meUrl }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.username }`)
		.catch((err) => {
			console.log(err.message);
		});


const createPersonalAccessToken = async (headers) =>
	await axios
		.post(
			apiEndpoints.generatetokenurl, {
				tokenName: 'alexaRocketChatNotifications',
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return res.token;
			} else {
				console.log(res);
				return '';
			}
		})
		.catch(async (err) => {
			console.log(err.message);
			if (
				err.response.data.errorType === 'error-token-already-exists'
			) {
				return await removePersonalAccessToken(headers); // eslint-disable-line no-use-before-define
			}
			return '';
		});

const removePersonalAccessToken = async (headers) =>
	await axios
		.post(
			apiEndpoints.removetokenurl, {
				tokenName: 'alexaRocketChatNotifications',
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then(async (res) => {
			if (res.success === true) {
				return await createPersonalAccessToken(headers);
			} else {
				console.log(res);
				return '';
			}
		})
		.catch((err) => {
			console.log(err.message);
			return '';
		});

const channelList = async (headers) =>
	await axios
		.get(`${ apiEndpoints.channellisturl }?fields={ "name": 1 }&sort={"_updatedAt":-1}&count=100`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => res.channels.map((i) => ({
			name: {
				value: i.name,
			},
		})))
		.catch((err) => {
			console.log(err.message);
		});

const createChannel = async (channelName, headers) =>
	await axios
		.post(
			apiEndpoints.createchannelurl, {
				name: channelName,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('CREATE_CHANNEL.SUCCESS', {
					channelName,
				});
			} else {
				return ri('CREATE_CHANNEL.ERROR', {
					channelName,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (
				err.response.data.errorType === 'error-duplicate-channel-name'
			) {
				return ri('CREATE_CHANNEL.ERROR_DUPLICATE_NAME', {
					channelName,
				});
			} else if (
				err.response.data.errorType === 'error-invalid-room-name'
			) {
				return ri('CREATE_CHANNEL.ERROR_INVALID_NAME', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('CREATE_CHANNEL.AUTH_ERROR');
			} else {
				return ri('CREATE_CHANNEL.ERROR', {
					channelName,
				});
			}
		});

const deleteRoom = (roomDetails, headers) =>
	axios
		.post(
			roomDetails.type === 'c' ? apiEndpoints.deletechannelurl : apiEndpoints.deletegroupurl, {
				roomName: roomDetails.name,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('DELETE_CHANNEL.SUCCESS', {
					channelName: roomDetails.name, success: true,
				});
			} else {
				return ri('DELETE_CHANNEL.ERROR', {
					channelName: roomDetails.name,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.data.errorType === 'error-room-not-found') {
				return ri('DELETE_CHANNEL.ERROR_NOT_FOUND', {
					channelName: roomDetails.name,
				});
			} else if (err.response.data.errorType === 'error-not-allowed') {
				return ri('DELETE_CHANNEL.NOT_AUTHORISED');
			} else if (err.response.status === 401) {
				return ri('DELETE_CHANNEL.AUTH_ERROR');
			} else {
				return ri('DELETE_CHANNEL.ERROR', {
					channelName: roomDetails.name,
				});
			}
		});

const postMessage = async (channelName, message, headers) =>
	await axios
		.post(
			apiEndpoints.postmessageurl, {
				channel: `#${ channelName }`,
				// make the first letter to upper case
				text: message[0].toUpperCase() + message.slice(1),
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('POST_MESSAGE.SUCCESS');
			} else {
				return ri('POST_MESSAGE.ERROR');
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.status === 401) {
				return ri('POST_MESSAGE.AUTH_ERROR');
			} else {
				return ri('POST_MESSAGE.ERROR');
			}
		});

const getLastMessageType = async (channelName, type, headers) =>
	await axios
		.get(`${ type === 'c' ? apiEndpoints.channelmessageurl : apiEndpoints.groupmessagenameurl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => {
			if (!res.messages[0].file) {
				return 'textmessage';
			} else {
				return res.messages[0].file.type;
			}
		})
		.catch((err) => {
			console.log(err.message);
		});

const channelLastMessage = async (channelName, type, headers) =>
	await axios
		.get(`${ type === 'c' ? apiEndpoints.channelmessageurl : apiEndpoints.groupmessagenameurl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.SUCCESS', {
					name: res.messages[0].u.username,
					message: res.messages[0].msg,
				});
			} else {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.data.errorType === 'error-room-not-found') {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR_NOT_FOUND', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.AUTH_ERROR');
			} else {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		});


const readMessages = async (roomid, headers) =>
	await axios
		.post(apiEndpoints.markasreadurl, {
			rid: roomid,
		}, {
			headers,
		})
		.then((res) => {
			console.log(res.data);
		})
		.catch((err) => {
			console.log(err.message);
		});


const getLastMessageFileURL = async (channelName, type, headers) =>
	await axios
		.get(`${ type === 'c' ? apiEndpoints.channelmessageurl : apiEndpoints.groupmessagenameurl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `https://${ serverurl }/file-upload/${ res.messages[0].file._id }/${ res.messages[0].file.name }`)
		.catch((err) => {
			console.log(err.message);
		});

const getLastMessageFileDowloadURL = async (fileurl, headers) =>
	await axios
		.get(fileurl, {
			headers,
		})
		.then((response) => `${ response.request.res.responseUrl }`)
		.catch((err) => {
			console.log(err.message);
		});

const getUnreadCounter = async (channelName, headers) =>
	await axios
		.get(`${ apiEndpoints.counterurl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.unreads }`)
		.catch((err) => {
			console.log(err.message);
		});

// PLEASE DO NOT REFACTOR CHANNELUNREADMESSAGES FUNCTION
const channelUnreadMessages = async (channelName, unreadCount, headers) => {
	if (unreadCount === 0) { return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE'), { channelName }; }

	return await axios
		.get(`${ apiEndpoints.channelmessageurl }${ channelName }&count=${ unreadCount }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {

				const msgs = [];

				for (let i = 0; i <= unreadCount - 1; i++) {
					// anything other than text messages are ignored
					if (!res.messages[i].hasOwnProperty('t') && !res.messages[i].hasOwnProperty('file')) {
						msgs.push(`${ res.messages[i].u.username } says, ${ removeEmojis(res.messages[i].msg) }. <break time="0.7s"/> `);
					}
				}

				const responseString = msgs.join('  ');

				const finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.MESSAGE', {
					channelName,
					respString: responseString,
					unread: msgs.length,
				});

				return finalMsg;

			} else {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.data.errorType === 'error-room-not-found') {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR_NOT_FOUND', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.AUTH_ERROR');
			} else {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		});
};

const getUserId = async (userName, headers) =>
	await axios
		.get(`${ apiEndpoints.userinfourl }${ userName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.user._id }`)
		.catch((err) => {
			console.log(err.message);
		});

const getRoomId = async (channelName, headers) =>
	await axios
		.get(`${ apiEndpoints.channelinfourl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.channel._id }`)
		.catch((err) => {
			console.log(err.message);
		});

const addAll = async (channelName, roomid, headers) =>
	await axios
		.post(
			apiEndpoints.addallurl, {
				roomId: roomid,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('ADD_ALL_TO_CHANNEL.SUCCESS', {
					channelName,
				});
			} else {
				return ri('ADD_ALL_TO_CHANNEL.ERROR');
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.status === 401) {
				return ri('ADD_ALL_TO_CHANNEL.AUTH_ERROR');
			} else {
				return ri('ADD_ALL_TO_CHANNEL.ERROR');
			}
		});

const archiveChannel = async (roomId, roomname, type, headers) => {
	try {
		let response;

		if (type === 'c') {
			response = await axios.post(apiEndpoints.archivechannelurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.post(apiEndpoints.archivegroupurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		}


		if (response.success) { return ri('ARCHIVE_CHANNEL.SUCCESS', { roomname }); }

		return ri('ARCHIVE_CHANNEL.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-not-authorized') {
			return ri('ARCHIVE_CHANNEL.NOT_AUTHORISED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-archived') {
			return ri('ARCHIVE_CHANNEL.ROOM_ALREAD_ARCHIVED', { roomname });
		} else if (err.response.status === 401) {
			return ri('ARCHIVE_CHANNEL.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ARCHIVE_CHANNEL.ERROR');
		}
	}
};

const unarchiveChannel = async (roomId, roomname, type, headers) => {
	try {
		let response;

		if (type === 'c') {
			response = await axios.post(apiEndpoints.unarchivechannelurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.post(apiEndpoints.unarchivegroupurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		}


		if (response.success) { return ri('ARCHIVE_CHANNEL.UNARCHIVE_SUCCESS', { roomname }); }

		return ri('ARCHIVE_CHANNEL.UNARCHVIE_ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-not-authorized') {
			return ri('ARCHIVE_CHANNEL.NOT_AUTHORISED');
		} else if (err.response.status === 401) {
			return ri('ARCHIVE_CHANNEL.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ARCHIVE_CHANNEL.UNARCHVIE_ERROR');
		}
	}
};

function replaceWhitespacesFunc(str) {
	return removeWhitespace(str);
}

function replaceWhitespacesDots(str) {
	return str.replace(/\s/ig, '.');
}

function emojiTranslateFunc(str) {
	const onlyEmoji = true;
	return emojiTranslate.translate(str, onlyEmoji);
}

const createGroup = async (channelName, headers) =>
	await axios
		.post(
			apiEndpoints.creategroupurl, {
				name: channelName,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('CREATE_CHANNEL.SUCCESS_GROUP', {
					channelName,
				});
			} else {
				return ri('CREATE_CHANNEL.ERROR_GROUP', {
					channelName,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.data.errorType === 'error-duplicate-channel-name') {
				return ri('CREATE_CHANNEL.ERROR_DUPLICATE_NAME', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('CREATE_CHANNEL.AUTH_ERROR');
			} else if (err.response.data.errorType === 'error-invalid-room-name') {
				return ri('CREATE_CHANNEL.ERROR_INVALID_NAME', {
					channelName,
				});
			} else {
				return ri('CREATE_CHANNEL.ERROR', {
					channelName,
				});
			}
		});

const getGroupId = async (channelName, headers) =>
	await axios
		.get(`${ apiEndpoints.groupinfourl }${ channelName }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.group._id }`)
		.catch((err) => {
			console.log(err.message);
		});

const postGroupMessage = async (roomid, message, headers) =>
	await axios
		.post(
			apiEndpoints.postmessageurl, {
				roomId: roomid,
				text: message,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('POST_MESSAGE.SUCCESS');
			} else {
				return ri('POST_MESSAGE.ERROR');
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.status === 401) {
				return ri('POST_MESSAGE.AUTH_ERROR');
			} else {
				return ri('POST_MESSAGE.ERROR');
			}
		});

const groupLastMessage = async (channelName, roomid, headers) =>
	await axios
		.get(`${ apiEndpoints.groupmessageurl }${ roomid }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.SUCCESS', {
					name: res.messages[0].u.username,
					message: res.messages[0].msg,
				});
			} else {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		})
		.catch((err) => {
			console.log(err.message);
			if (err.response.data.errorType === 'error-room-not-found') {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR_NOT_FOUND', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.AUTH_ERROR');
			} else {
				return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', {
					channelName,
				});
			}
		});

const getGroupUnreadCounter = async (roomid, headers) =>
	await axios
		.get(`${ apiEndpoints.groupcounterurl }${ roomid }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => `${ res.unreads }`)
		.catch((err) => {
			console.log(err.message);
		});

const groupUnreadMessages = async (channelName, roomid, unreadCount, headers) => {
	if (unreadCount === 0) { return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE', { channelName }); }

	return await axios
		.get(`${ apiEndpoints.groupmessageurl }${ roomid }&count=${ unreadCount }`, {
			headers,
		})
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {

				const msgs = [];

				for (let i = 0; i <= unreadCount - 1; i++) {
					// anything other than text messages are ignored
					if (!res.messages[i].hasOwnProperty('t') && !res.messages[i].hasOwnProperty('file')) {
						msgs.push(`${ res.messages[i].u.username } says, ${ removeEmojis(res.messages[i].msg) }. <break time="0.7s"/> `);
					}
				}

				const responseString = msgs.join('  ');

				const finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.MESSAGE', {
					channelName,
					respString: responseString,
					unread: msgs.length,
				});

				return finalMsg;

			} else {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR');
			}
		})
		.catch((err) => {
			console.log(err.message);
			console.log(err.message);
			if (err.response.data.errorType === 'error-room-not-found') {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR_NOT_FOUND', {
					channelName,
				});
			} else if (err.response.status === 401) {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.AUTH_ERROR');
			} else {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR');
			}
		});
};

const createDMSession = async (userName, headers) =>
	await axios
		.post(
			apiEndpoints.createimurl, {
				username: userName,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => `${ res.room._id }`)
		.catch((err) => {
			console.log(err.message);
		});

const postDirectMessage = async (message, roomid, headers) =>
	await axios
		.post(
			apiEndpoints.postmessageurl, {
				roomId: roomid,
				text: message,
			}, {
				headers,
			}
		)
		.then((res) => res.data)
		.then((res) => {
			if (res.success === true) {
				return ri('POST_MESSAGE.SUCCESS');
			} else {
				return ri('POST_MESSAGE.ERROR');
			}
		})
		.catch((err) => {
			console.log(err.message);
			return ri('POST_MESSAGE.ERROR');
		});

// this function resolves channel names from all the rooms that the user has joined
const resolveChannelname = async (channelName, headers, single = false) => {
	try {
		channelName = channelName.toLowerCase();
		// load all subscriptions
		const subscriptions = await axios.get(apiEndpoints.getsubscriptionsurl, {
			headers,
		})
			.then((res) => res.data.update)
			// filter only channels and groups
			.then((subscriptions) => subscriptions.filter((subscription) => subscription.t === 'c' || subscription.t === 'p'))
			// make every room in {name, id, type} form
			.then((subscriptions) => subscriptions.map((subscription) => ({
				name: subscription.name,
				id: subscription.rid,
				type: subscription.t,
			})));

		// iterate through the subscriptions array once, find the top 3 matching rooms
		let bestRating = -1;
		let secondBestRating = -1;
		let thirdBestRating = -1;
		let bestIndex;
		let secondBestIndex;
		let thirdBestIndex;

		for (const [i, room] of subscriptions.entries()) {
			const rating = stringSimilar.compareTwoStrings(room.name.toLowerCase(), channelName);
			if (rating > bestRating) {
				let temp = secondBestRating;
				secondBestRating = bestRating;
				bestRating = rating;
				thirdBestRating = temp;
				temp = secondBestIndex;
				secondBestIndex = bestIndex;
				bestIndex = i;
				thirdBestIndex = temp;
			} else if (rating > secondBestRating) {
				thirdBestRating = secondBestRating;
				secondBestRating = rating;
				thirdBestIndex = secondBestIndex;
				secondBestIndex = i;
			} else if (rating > thirdBestRating) {
				thirdBestRating = rating;
				thirdBestIndex = i;
			}
		}

		const similarRooms = [];
		similarRooms.push(subscriptions[bestIndex]);
		// return best match if single room is requested
		if (single) {
			return similarRooms;
		}

		// return and empty array if there's no good match
		if (bestRating < 0.2) {
			return [];
		}

		// return the best match if the best rating is "not that best"
		if (bestRating <= 0.7) {
			return similarRooms;
		} else {
			// if the best rating is high, then check the second best and third best ratings
			if (secondBestRating > 0.7) {
				similarRooms.push(subscriptions[secondBestIndex]);
			}
			if (thirdBestRating > 0.7) {
				similarRooms.push(subscriptions[thirdBestIndex]);
			}
			return similarRooms;
		}

	} catch (err) {
		throw err;
	}
};

// this function will resolve channelnames from the latest 100 active channels and groups that the user is part of
/*
this function takes in a string as an input and returns an array of channel/group names which
the user has joined and are similar to the input string
*/
const resolveChannelnameFromLatestActiveRooms = async (channelName, headers, single = false) => {
	try {
		// sort wrt prid, so the discussions will end up at the end.
		const publicChannelsResponse = await axios.get(`${ apiEndpoints.channellisturl }?sort={"prid": 1, "_updatedAt": -1}&fields={"_id": 1, "name": 1, "t": 1}&count=100`, {
			headers,
		}).then((res) => res.data);

		const privateChannelsResponse = await axios.get(`${ apiEndpoints.grouplisturl }?sort={"prid": 1, "_updatedAt": -1}&fields={"_id": 1, "name": 1, "t": 1}&count=100`, {
			headers,
		}).then((res) => res.data);

		// adding public channels to the array
		let channels = publicChannelsResponse.channels.map((channel) => ({
			name: channel.name,
			id: channel._id,
			type: channel.t }));

		// adding private channels to the array
		channels = channels.concat(privateChannelsResponse.groups.map((channel) => ({
			name: channel.name,
			id: channel._id,
			type: channel.t,
		})));

		let bestIndex = -1;
		let bestMatchingChannel;
		const similarChannels = [];
		for (const channel of channels) {
			const index = stringSimilar.compareTwoStrings(channel.name, channelName);
			if (index > bestIndex) {
				bestIndex = index;
				bestMatchingChannel = channel;
			}
			if (index >= envVariables.lowerSimilarityIndex) {
				similarChannels.push(channel);
			}
		}

		// if best matching name has passed the upper similarity index or if the function is called to return only best matching result
		if (bestIndex >= envVariables.upperSimilarityIndex || single) { return [bestMatchingChannel]; }
		return similarChannels;

	} catch (err) {
		console.log(err);
	}
};

// this function resolves usernames from all the DMs that the user has joined
/*
this function takes a string an an input and returns an array of usernames
which the user is in contact with and is similar to the input string
*/
const resolveUsername = async (username, headers, single = false) => {
	try {
		const subscriptions = await axios.get(apiEndpoints.getsubscriptionsurl, {
			headers,
		})
			.then((res) => res.data.update)
		// the getsubscriptionsurl returns all subscriptions including private and public channels
		// since we only need to resolve usernames we filter only direct message subscriptions
			.then((subscriptions) => subscriptions.filter((subscription) => subscription.t === 'd'))
			.then((subscriptions) => subscriptions.map((subscription) => ({
				name: subscription.name, // name of the other dm user
				// the rid property is a combination of id's of two users involved in the direct chat
				// removing the id of the current user from rid will give id of the other user
				id: subscription.rid.replace(subscription.u._id, ''), // user id of the other dm user
				rid: subscription.rid, // room id of the dm room
				type: subscription.t, // type of the room 't' in this case
			})));

		// Note: A different method can be used to get the list of direct message users from contacts
		// const subscriptions must be of the form [{name: 'username', id: 'user id', type: 'd'}, ...]

		let bestIndex = -1;
		let bestMatchingUser;
		const similarUsers = [];
		for (const user of subscriptions) {
			const index = stringSimilar.compareTwoStrings(user.name.replace(/\./g, ' '), username);
			if (index > bestIndex) {
				bestIndex = index;
				bestMatchingUser = user;
			}
			if (index >= envVariables.lowerSimilarityIndex) {
				similarUsers.push(user);
			}
		}

		// if best matching name has passed the upper similarity index or if the function is called to return only best matching result
		if (bestIndex >= envVariables.upperSimilarityIndex || single) { return [bestMatchingUser]; }
		return similarUsers;

	} catch (err) {
		console.log(err);
	}
};

// this functions logs the data to an external site
const customLog = async (data) => {
	try {
		await axios.post(envVariables.customLogUrl, (data));
	} catch (err) {
		// console.log(err);
	}
};

const setAnnouncement = async (room, announcement, headers) => {
	try {
		const url = room.type === 'c' ? apiEndpoints.setannouncementchannelurl : apiEndpoints.setannouncementgroupurl;
		const response = await axios.post(url, {
			roomId: room.id, announcement,
		}, {
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('CHANNEL_DETAILS.SET_ANNOUNCEMENT_SUCCESS', { roomname: room.name, success: true });
		}
		return ri('CHANNEL_DETAILS.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-action-not-allowed') {
			return ri('CHANNEL_DETAILS.NOT_AUTHORISED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('CHANNEL_DETAILS.ERROR_NOT_FOUND', { roomname: room.name });
		} else if (err.response.status === 401) {
			return ri('CHANNEL_DETAILS.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('CHANNEL_DETAILS.ERROR');
		}
	}
};

const setTopic = async (room, topic, headers) => {
	try {
		const url = room.type === 'c' ? apiEndpoints.settopicchannelurl : apiEndpoints.settopicgroupurl;
		const response = await axios.post(url, {
			roomId: room.id, topic,
		}, {
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('CHANNEL_DETAILS.SET_TOPIC_SUCCESS', { roomname: room.name, success: true });
		}
		return ri('CHANNEL_DETAILS.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-action-not-allowed') {
			return ri('CHANNEL_DETAILS.NOT_AUTHORISED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('CHANNEL_DETAILS.ERROR_NOT_FOUND', { roomname: room.name });
		} else if (err.response.status === 401) {
			return ri('CHANNEL_DETAILS.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('CHANNEL_DETAILS.ERROR');
		}
	}
};

const setDescription = async (room, description, headers) => {
	try {
		const url = room.type === 'c' ? apiEndpoints.setdescriptionchannelurl : apiEndpoints.setdescriptiongroupurl;
		const response = await axios.post(url, {
			roomId: room.id, description,
		}, {
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('CHANNEL_DETAILS.SET_DESCRIPTION_SUCCESS', { roomname: room.name, success: true });
		}

		return ri('CHANNEL_DETAILS.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-action-not-allowed') {
			return ri('CHANNEL_DETAILS.NOT_AUTHORISED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('CHANNEL_DETAILS.ERROR_NOT_FOUND', { roomname: room.name });
		} else if (err.response.status === 401) {
			return ri('CHANNEL_DETAILS.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('CHANNEL_DETAILS.ERROR');
		}
	}
};

const leaveChannel = async (roomId, roomname, type, headers) => {
	try {
		let response;
		if (type === 'c') {
			response = await axios.post(apiEndpoints.leavechannelurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.post(apiEndpoints.leavegroupurl, {
				roomId,
			},
			{
				headers,
			}).then((res) => res.data);
		}
		if (response.success) { return ri('LEAVE_CHANNEL.SUCCESS', { roomname }); }

		return ri('LEAVE_CHANNEL.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return ri('LEAVE_CHANNEL.USER_NOT_IN_ROOM', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-you-are-last-owner') {
			return ri('LEAVE_CHANNEL.ERROR_LAST_OWNER');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('LEAVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('LEAVE_CHANNEL.ERROR_NOT_FOUND', { roomname });
		} else if (err.response.status === 401) {
			return ri('AUTH_ERROR');
		} else {
			console.log(err);
			return ri('LEAVE_CHANNEL.ERROR');
		}
	}
};

const resolveDiscussion = async (discussionName, headers) => {
	try {
		// prid sort so that the normal rooms will be considered last
		const groupDiscussions = await axios.get(`${ apiEndpoints.grouplisturl }?sort={"prid": -1, "_updatedAt": -1}&fields={"_id": 1, "name": 1, "fname": 1, "prid": 1, "t": 1}&count=100`, {
			headers,
		}).then((res) => res.data.groups);

		const channelDiscussions = await axios.get(`${ apiEndpoints.channellisturl }?sort={"prid": -1, "_updatedAt": -1}&fields={"_id": 1, "name": 1, "fname": 1, "prid": 1, "t": 1}&count=100`, {
			headers,
		}).then((res) => res.data.channels);

		const discussionDetails = [];
		const discussionNames = [];

		for (const discussion of groupDiscussions.concat(channelDiscussions)) {
			// if prid doesn't exist it's not a discussion
			if (!discussion.prid) { continue; }

			discussionDetails.push({
				id: discussion._id, // id of the discussion room
				name: discussion.name, // the unique name of the discussion
				fname: discussion.fname, // the display name of the discussion
				type: discussion.t, // type: private (p), public(c)
			});

			discussionNames.push(discussion.fname.toLowerCase());
		}

		if (discussionNames.length === 0) { return null; }

		const comparison = stringSimilar.findBestMatch(removeWhitespace(discussionName).toLowerCase(), discussionNames);
		if (comparison.bestMatch.rating > 0) {
			return discussionDetails[comparison.bestMatchIndex];
		} else {
			return null;
		}

	} catch (err) {
		throw err;
	}
};

const roomUnreadMessages = async (channelName, unreadCount, type, headers, handlerInput, fname = null) => {
	try {
		// fname is optional and is used as a display name for discussions
		if (fname) { fname = `Discussion ${ fname }`; }
		// this must be ==
		// eslint-disable-next-line eqeqeq
		if (!unreadCount || unreadCount == 0) {
			return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE_IN_DISCUSSION', { channelName: fname || channelName });
		}

		const res = await axios
			.get(`${ type === 'c' ? apiEndpoints.channelmessageurl : apiEndpoints.groupmessagenameurl }${ channelName }&count=${ unreadCount }`, {
				headers,
			})
			.then((res) => res.data);

		if (res.success === true) {

			const msgs = [];
			const messages = [];
			let previousUsername = '';
			for (let i = 0; i <= unreadCount - 1; i++) {
				if (!res.messages[i]) { continue; }
				let speechText;

				// if it's just a normal text message
				if (!res.messages[i].file && !res.messages[i].t && res.messages[i].msg) {
					// check if the message is not empty or made of just dots.
					if (cleanMessage(res.messages[i].msg).replace(/\./g, ' ').trim()) {
						if (previousUsername === res.messages[i].u.username) {
							msgs.push(`${ res.messages[i].msg }. `);
						} else {
							msgs.push(`${ res.messages[i].u.username } says, ${ res.messages[i].msg }.`);
							previousUsername = res.messages[i].u.username;
						}
					}
					messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].msg }`);
				} else if (res.messages[i].t) {
					if (res.messages[i].t === 'room_changed_description') {
						speechText = handlerInput.translate('MESSAGE_TYPE.CHANGE_DESCRIPTION', { username: res.messages[i].u.username, description: res.messages[i].msg });
						msgs.push(speechText);
						messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].msg }`);
					} else if (res.messages[i].t === 'room_changed_topic') {
						speechText = handlerInput.translate('MESSAGE_TYPE.CHANGE_TOPIC', { username: res.messages[i].u.username, topic: res.messages[i].msg });
						msgs.push(speechText);
						messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].msg }`);
					} else if (res.messages[i].t === 'room_changed_announcement') {
						speechText = handlerInput.translate('MESSAGE_TYPE.CHANGE_ANNOUNCEMENT', { username: res.messages[i].u.username, announcement: res.messages[i].msg });
						msgs.push(speechText);
						messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].msg }`);
					} else if (res.messages[i].t === 'discussion-created') {
						speechText = handlerInput.translate('MESSAGE_TYPE.DISCUSSION_CREATED', { username: res.messages[i].u.username, name: res.messages[i].msg });
						msgs.push(speechText);
						messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].msg }`);
					}
				} else if (res.messages[i].file && res.messages[i].file.type) {
					if (res.messages[i].file.type.includes('image')) {
						speechText = handlerInput.translate('MESSAGE_TYPE.IMAGE_MESSAGE', { username: res.messages[i].u.username, title: res.messages[i].file.name });
					} else if (res.messages[i].file.type.includes('video')) {
						speechText = handlerInput.translate('MESSAGE_TYPE.VIDEO_MESSAGE', { username: res.messages[i].u.username, title: res.messages[i].file.name });
					} else {
						speechText = handlerInput.translate('MESSAGE_TYPE.FILE_MESSAGE', { username: res.messages[i].u.username, title: res.messages[i].file.name });
					}
					msgs.push(speechText);
					messages.push(`${ res.messages[i].u.username }: ${ res.messages[i].file.name }`);
				}
			}

			let responseString = msgs.join('  ');
			responseString = cleanMessage(responseString);
			// 8000 is the character limit of alexa response.
			responseString = responseString.slice(0, 7000);

			const finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.DISCUSSION_MESSAGE', { total: unreadCount, count: msgs.length, channelName: fname || channelName, responseString });

			// if there's nothing to display in the table just send the messsage.
			if (messages.length === 0) { return finalMsg; }
			// return [finalMsg, messages];
			return finalMsg;

		} else {
			return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR');
		}

	} catch (err) {
		throw err;
	}
};

const getRoomCounters = async (roomId, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.channelcounterurl : apiEndpoints.privateroomcounterurl;
		const response = await axios.get(`${ url }?roomId=${ roomId }`, {
			headers,
		}).then((res) => res.data);

		console.log(response);
		return response;
	} catch (err) {
		throw err;
	}
};

const readRoomUnreadMentions = async (channelDetails, count, headers, fname = undefined) => {
	try {
		if (fname) { fname = `Discussion ${ fname }`; }
		if (count === null) {
			return ri('ROOM_MENTIONS.ERROR');
		}
		// to be left as ==
		// eslint-disable-next-line eqeqeq
		if (count == 0) {
			return ri('ROOM_MENTIONS.NO_MENTIONS', { roomName: fname || channelDetails.name });
		}

		const response = await axios.get(`${ apiEndpoints.getmentionedmessagesurl }?roomId=${ channelDetails.id }&count=${ count }`, {
			headers,
		}).then((res) => res.data);

		if (response.success === true) {
			let finalMessage = '';
			const messages = [];

			response.messages.forEach((message) => {
				finalMessage += `${ message.u.username } says, ${ message.msg }.`;
				messages.push(`${ message.u.username }: ${ message.msg }.`);
			});

			finalMessage = cleanMessage(finalMessage);

			const speechText = ri('ROOM_MENTIONS.READ_MENTIONS', {
				finalMessage, count, roomName: fname || channelDetails.name,
			});

			// if there's nothing to display in the table just return speech text
			if (messages.length === 0) { return speechText; }
			return speechText;

			// return [speechText, messages];
		} else {
			return ri('ROOM_MENTIONS.ERROR');
		}

	} catch (err) {
		return ri('ROOM_MENTIONS.ERROR');
	}
};

const addLeader = async (roomId, userId, roomname, username, type, headers) => {
	try {
		let response;
		if (type === 'c') {
			response = await axios.post(apiEndpoints.addleadertochannelurl, {
				roomId, userId,
			},
			{
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.post(apiEndpoints.addleadertogroupurl, {
				roomId, userId,
			},
			{
				headers,
			}).then((res) => res.data);
		}

		if (response.success) {
			return ri('ROOM_ROLES.ADD_LEADER_SUCCESS', { username, roomname });
		}

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		console.log(err);
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-already-leader') {
			return ri('ROOM_ROLES.ALREADY_LEADER', { username, roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return ri('ROOM_ROLES.USER_NOT_MEMBER', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			return ri('ROOM_ROLES.ERROR');
		}
	}
};

const getUsersWithRolesFromRoom = async (recognisedUsername, roomId, type, role, headers) => {
	try {
		let response;
		if (type === 'c') {
			response = await axios.get(`${ apiEndpoints.getrolesfromchannelurl }?roomId=${ roomId }`, {
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.get(`${ apiEndpoints.getrolesfromgroupurl }?roomId=${ roomId }`, {
				headers,
			}).then((res) => res.data);
		}

		const users = [];
		for (const user of response.roles) {
			if (user.roles.includes(role)) {
				users.push(user.u);
			}
		}

		if (!response.success) {
			return 'error';
		}

		const similarUsers = users.filter((user) => stringSimilar.compareTwoStrings(recognisedUsername, user.username) > envVariables.lowestSimilarityIndex);

		console.log(similarUsers);
		return similarUsers;

	// all the below errors will not be reached with the current conversation flow
	} catch (err) {
		console.log(err);
		if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return 'You are not part of this room';
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return 'no such room';
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return 'no such room';
		} else if (err.response.status === 401) {
			return 'login before using this intent';
		} else {
			return 'error';
		}
	}

};

const removeLeader = async (roomId, userId, roomname, username, type, headers) => {
	try {
		let response;
		if (type === 'c') {
			response = await axios.post(apiEndpoints.removeleaderfromchannelurl, {
				roomId, userId,
			},
			{
				headers,
			}).then((res) => res.data);
		} else if (type === 'p') {
			response = await axios.post(apiEndpoints.removeleaderfromgroupurl, {
				roomId, userId,
			},
			{
				headers,
			}).then((res) => res.data);
		}


		if (response.success) { return ri('ROOM_ROLES.REMOVE_LEADER_SUCCESS', { username, roomname }); }

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-leader') {
			return ri('ROOM_ROLES.USER_NOT_LEADER', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ROOM_ROLES.ERROR');
		}
	}

};

const removeOwner = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.removeownerfromchannelurl : apiEndpoints.removeownerfromgroupurl;
		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);
		if (response.success) { return ri('ROOM_ROLES.REMOVE_OWNER_SUCCESS', { username, roomname }); }

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-remove-last-owner') {
			return ri('ROOM_ROLES.ERROR_REMOVE_LAST_OWNER');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-owner') {
			return ri('ROOM_ROLES.USER_NOT_OWNER', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ROOM_ROLES.ERROR');
		}
	}

};

const removeModerator = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.removemoderatorfromchannelurl : apiEndpoints.removemoderatorfromgroupurl;

		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);

		if (response.success) { return ri('ROOM_ROLES.REMOVE_MODERATOR_SUCCESS', { username, roomname }); }

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-moderator') {
			return ri('ROOM_ROLES.USER_NOT_MODERATOR', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ROOM_ROLES.ERROR');
		}
	}
};

const addOwner = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.addownertochannelurl : apiEndpoints.addownertogroupurl;

		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('ROOM_ROLES.ADD_OWNER_SUCCESS', { username, roomname });
		}

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-already-owner') {
			return ri('ROOM_ROLES.ALREADY_OWNER', { username, roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return ri('ROOM_ROLES.USER_NOT_MEMBER', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ROOM_ROLES.ERROR');
		}
	}
};

const addModerator = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.addmoderatortochannelurl : apiEndpoints.addmoderatortogroupurl;

		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('ROOM_ROLES.ADD_MODERATOR_SUCCESS', { username, roomname });
		}

		return ri('ROOM_ROLES.ERROR');

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ROOM_ROLES.ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ROOM_ROLES.ERROR_ROOM_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ROOM_ROLES.INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-already-moderator') {
			return ri('ROOM_ROLES.ALREADY_MODERATOR', { username, roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return ri('ROOM_ROLES.USER_NOT_MEMBER', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('ROOM_ROLES.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('ROOM_ROLES.ERROR');
		}
	}
};

const renameChannel = async (room, newname, headers) => {
	try {
		const url = room.type === 'c' ? apiEndpoints.renamechannelurl : apiEndpoints.renamegroupurl;
		// remove whitespaces from the newname
		newname = newname.trim().split(' ').join('');
		const response = await axios.post(url, {
			roomId: room.id, name: newname,
		}, {
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('CHANNEL_DETAILS.RENAME_ROOM_SUCCESS', { oldname: room.name, newname, success: true });
		}
		return ri('CHANNEL_DETAILS.ERROR');

	} catch (err) {
		console.log(err);
		if (err.response.data.errorType && err.response.data.errorType === 'error-action-not-allowed') {
			return ri('CHANNEL_DETAILS.NOT_AUTHORISED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('CHANNEL_DETAILS.ERROR_NOT_FOUND', { roomname: room.name });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-duplicate-channel-name') {
			return ri('CHANNEL_DETAILS.ERROR_NAME_TAKEN', { newname });
		} else if (err.response.status === 401) {
			return ri('CHANNEL_DETAILS.AUTH_ERROR');
		} else {
			console.log(err);
			return ri('CHANNEL_DETAILS.ERROR');
		}
	}
};

const inviteUser = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.invitetochannelurl : apiEndpoints.invitetogroupurl;

		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);

		if (response.success) { return ri('INVITE_USER.SUCCESS', { username, roomname }); }

		return ri('INVITE_USER.ERROR');

	} catch (err) {
		console.log(err);
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ERROR_INVALID_USER', { username });
		} else if (err.response.status === 401) {
			return ri('AUTH_ERROR');
		} else {
			return ri('INVITE_USER.ERROR');
		}
	}
};

const kickUser = async (roomId, userId, roomname, username, type, headers) => {
	try {
		const url = type === 'c' ? apiEndpoints.kickuserfromchannelurl : apiEndpoints.kickuserfromgroupurl;

		const response = await axios.post(url, {
			roomId, userId,
		},
		{
			headers,
		}).then((res) => res.data);

		console.log(response);

		if (response.success) { return ri('KICK_USER.SUCCESS', { username, roomname }); }

		return ri('KICK_USER.ERROR');

	} catch (err) {
		console.log(err);
		if (err.response.data.errorType && err.response.data.errorType === 'error-not-allowed') {
			return ri('ERROR_NOT_ALLOWED');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-room-not-found') {
			return ri('ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ERROR_NOT_FOUND', { roomname });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-user') {
			return ri('ERROR_INVALID_USER', { username });
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-you-are-last-owner') {
			return ri('KICK_USER.ERROR_YOU_ARE_LAST_OWNER');
		} else if (err.response.data.errorType && err.response.data.errorType === 'error-user-not-in-room') {
			return ri('KICK_USER.ERROR_USER_NOT_IN_ROOM', { username, roomname });
		} else if (err.response.status === 401) {
			return ri('AUTH_ERROR');
		} else {
			return ri('KICK_USER.ERROR');
		}
	}
};

const setStatus = async (message, headers) => {
	try {
		const response = await axios.post(apiEndpoints.setstatusurl, {
			message,
		}, {
			headers,
		}).then((res) => res.data);

		if (response.success) {
			return ri('STATUS.SUCCESS');
		}
		return ri('STATUS.ERROR');
	} catch (err) {
		console.log(err);
		return ri('STATUS.ERROR');
	}
};

const readPinnedMessages = async (roomId, channelname, headers) => {
	try {
		const response = await axios.get(`${ apiEndpoints.readpinnedmessagesurl }?roomId=${ roomId }`, {
			headers,
		}).then((res) => res.data);

		if (!response.success) { return ri('PINNED_MESSAGES.ERROR'); }
		if (response.count === 0) { return ri('PINNED_MESSAGES.NO_PINNED_MESSAGES', { channelname }); }

		const messages = [];
		for (const message of response.messages) {
			messages.push([message.u.username, message.msg]);
		}
		return messages;

	} catch (err) {
		if (err.response.data.errorType && err.response.data.errorType === 'error-invalid-room') {
			return ri('ERROR_INVALID_ROOM');
		} else if (err.response.status === 401) {
			return ri('AUTH_ERROR');
		} else {
			return ri('ERROR');
		}
	}
};

const getAllUnreads = async (headers) => {
	try {

		const subscriptions = await axios.get(apiEndpoints.getsubscriptionsurl, {
			headers,
		})
			.then((res) => res.data.update);
		let finalMessage = '';

		for (const subscription of subscriptions) {
			if (subscription.unread && subscription.unread !== 0) {
				// if it is a discussion then use fname for reference
				if (subscription.prid) {
					finalMessage += `${ subscription.unread } unreads from discussion ${ subscription.fname }, `;
					continue;
				}
				if (subscription.t && subscription.t === 'd') {
					finalMessage += `${ subscription.unread } unreads from ${ subscription.name }, `;
				} else {
					finalMessage += `${ subscription.unread } unreads in ${ subscription.name }, `;
				}
			}
		}

		finalMessage = finalMessage.slice(0, 7000);

		if (finalMessage === '') { return ri('UNREADS.NO_UNREADS'); }
		return ri('UNREADS.MESSAGE', { finalMessage });
	} catch (err) {
		console.log(err.message);
		return ri('UNREADS.ERROR');
	}
};

const getAllUnreadMentions = async (headers) => {
	try {

		const subscriptions = await axios.get(apiEndpoints.getsubscriptionsurl, {
			headers,
		})
			.then((res) => res.data.update);
		let finalMessage = '';

		for (const subscription of subscriptions) {
			if (subscription.userMentions && subscription.userMentions !== 0) {
				// if it is a discussion then use fname as reference
				if (subscription.prid) {
					finalMessage += `${ subscription.userMentions } mentions from discussion ${ subscription.fname }, `;
					continue;
				}
				if (subscription.t && subscription.t === 'd') {
					finalMessage += `${ subscription.userMentions } mentions from ${ subscription.name },`;
				} else {
					finalMessage += `${ subscription.userMentions } mentions in ${ subscription.name },`;
				}
			}
		}

		finalMessage = finalMessage.slice(0, 7000);

		if (finalMessage === '') { return ri('MENTIONS.NO_MENTIONS'); }
		return ri('MENTIONS.MESSAGE', { finalMessage });
	} catch (err) {
		console.log(err.message);
		return ri('MENTIONS.ERROR');
	}
};

const getUnreadMentionsCountChannel = async (roomName, headers) => {
	try {
		const response = await axios.get(`${ apiEndpoints.counterurl }${ roomName }`, {
			headers,
		}).then((res) => res.data);

		return response.userMentions;
	} catch (err) {
		console.log(err);
	}
};

const getUnreadMentionsCountGroup = async (roomId, headers) => {
	try {
		const response = await axios.get(`${ apiEndpoints.groupcounterurl }${ roomId }`, {
			headers,
		}).then((res) => res.data);

		return response.userMentions;
	} catch (err) {
		console.log(err);
	}
};

const readUnreadMentions = async (roomId, roomName, count, headers) => {
	try {
		if (count === 0) { return ri('MENTIONS.NO_MENTIONS_ROOM', { roomName }); }

		const response = await axios.get(`${ apiEndpoints.getmentionedmessagesurl }?roomId=${ roomId }&count=${ count }`, {
			headers,
		}).then((res) => res.data);

		if (response.success === true) {
			let finalMessage = '';

			response.messages.forEach((message) => {
				finalMessage += `${ message.u.username } says, ${ message.msg } <break time="0.7s"/>`;
			});

			return ri('MENTIONS.READ_MENTIONS', {
				finalMessage, count, roomName,
			});
		} else {
			return ri('MENTIONS.ERROR');
		}

	} catch (err) {
		return ri('MENTIONS.ERROR');
	}
};

const DMUnreadMessages = async (name, count, headers) => {
	try {
		if (count == null) {
			return ri('SOMETHING_WENT_WRONG');
		}
		// eslint-disable-next-line eqeqeq
		if (count == 0) {
			return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE_IN_DM', { name });
		}

		const res = await axios
			.get(`${ apiEndpoints.immessageurl }?username=${ name }&count=${ count }`, {
				headers,
			})
			.then((res) => res.data);

		if (res.success === true) {

			const msgs = [];

			for (let i = 0; i <= count - 1; i++) {
				if (res.messages[i] && !res.messages[i].t) {
					if (res.messages[i].file) {
						msgs.push(`Sent you a file named ${ res.messages[i].file.name }.`);
					} else if (res.messages[i].msg) { msgs.push(`${ res.messages[i].msg }.`); }
				}
			}

			let responseString = msgs.join('  ');
			responseString = cleanMessage(responseString);

			const finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.DM_MESSAGE', { unread: msgs.length, name, responseString });

			// return [finalMsg, msgs];
			return finalMsg;

		} else {
			return ri('SOMETHING_WENT_WRONG');
		}
	} catch (err) {
		console.log(err);
		throw err.message;
	}
};

const getDMCounter = async (id, headers) => {
	try {
		console.log(id);
		const response = await axios.get(`${ apiEndpoints.imcountersurl }?roomId=${ id }`, {
			headers,
		})
			.then((res) => res.data);
		return response;
	} catch (err) {
		throw 'Error while getting counters';
	}
};

// Module Export of Functions

module.exports.login = login;
module.exports.createPersonalAccessToken = createPersonalAccessToken;
module.exports.channelList = channelList;
module.exports.createChannel = createChannel;
module.exports.deleteRoom = deleteRoom;
module.exports.postMessage = postMessage;
module.exports.channelLastMessage = channelLastMessage;
module.exports.getLastMessageFileURL = getLastMessageFileURL;
module.exports.getLastMessageFileDowloadURL = getLastMessageFileDowloadURL;
module.exports.getUserId = getUserId;
module.exports.getUserName = getUserName;
module.exports.getRoomId = getRoomId;
module.exports.addAll = addAll;
module.exports.addOwner = addOwner;
module.exports.archiveChannel = archiveChannel;
module.exports.getUnreadCounter = getUnreadCounter;
module.exports.channelUnreadMessages = channelUnreadMessages;
module.exports.replaceWhitespacesFunc = replaceWhitespacesFunc;
module.exports.replaceWhitespacesDots = replaceWhitespacesDots;
module.exports.emojiTranslateFunc = emojiTranslateFunc;
module.exports.readMessages = readMessages;
module.exports.createGroup = createGroup;
module.exports.getGroupId = getGroupId;
module.exports.postGroupMessage = postGroupMessage;
module.exports.groupLastMessage = groupLastMessage;
module.exports.getGroupUnreadCounter = getGroupUnreadCounter;
module.exports.groupUnreadMessages = groupUnreadMessages;
module.exports.createDMSession = createDMSession;
module.exports.postDirectMessage = postDirectMessage;
module.exports.getLastMessageType = getLastMessageType;
module.exports.resolveChannelname = resolveChannelname;
module.exports.resolveUsername = resolveUsername;
module.exports.customLog = customLog;
module.exports.setAnnouncement = setAnnouncement;
module.exports.setDescription = setDescription;
module.exports.setTopic = setTopic;
module.exports.renameChannel = renameChannel;
module.exports.archiveChannel = archiveChannel;
module.exports.unarchiveChannel = unarchiveChannel;
module.exports.addLeader = addLeader;
module.exports.getUsersWithRolesFromRoom = getUsersWithRolesFromRoom;
module.exports.removeLeader = removeLeader;
module.exports.removeOwner = removeOwner;
module.exports.removeModerator = removeModerator;
module.exports.addModerator = addModerator;
module.exports.leaveChannel = leaveChannel;
module.exports.resolveDiscussion = resolveDiscussion;
module.exports.roomUnreadMessages = roomUnreadMessages;
module.exports.getRoomCounters = getRoomCounters;
module.exports.readRoomUnreadMentions = readRoomUnreadMentions;
module.exports.inviteUser = inviteUser;
module.exports.kickUser = kickUser;
module.exports.setStatus = setStatus;
module.exports.readPinnedMessages = readPinnedMessages;
module.exports.getAllUnreadMentions = getAllUnreadMentions;
module.exports.getUnreadMentionsCountChannel = getUnreadMentionsCountChannel;
module.exports.getUnreadMentionsCountGroup = getUnreadMentionsCountGroup;
module.exports.readUnreadMentions = readUnreadMentions;
module.exports.getAllUnreads = getAllUnreads;
module.exports.DMUnreadMessages = DMUnreadMessages;
module.exports.getDMCounter = getDMCounter;
module.exports.resolveChannelnameFromLatestActiveRooms = resolveChannelnameFromLatestActiveRooms; // not used currently

