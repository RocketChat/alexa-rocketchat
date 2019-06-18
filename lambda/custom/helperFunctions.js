const axios = require('axios');
const apiEndpoints = require('./apiEndpoints');
const envVariables = require('./config');

const Jargon = require('@jargon/alexa-skill-sdk');
const {
	ri
} = Jargon;

const removeWhitespace = require('remove-whitespace');
const emojiTranslate = require('moji-translate');

// Server Credentials. Follow readme to set them up.
const {
	oauthServiceName
} = envVariables;

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
		console.log(res);
		const headers = {
			'X-Auth-Token': res.data.authToken,
			'X-User-Id': res.data.userId,
		};
		return headers;
	})
	.catch((err) => {
		console.log(err);
	});

const createChannel = async (channelName, headers) =>
	await axios
	.post(
		apiEndpoints.createchannelurl, {
			name: channelName,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('CREATE_CHANNEL.SUCCESS', {
				channelName
			});
		} else {
			return ri('CREATE_CHANNEL.ERROR', {
				channelName
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
				channelName
			});
		} else {
			return ri('CREATE_CHANNEL.ERROR', {
				channelName
			});
		}
	});

const deleteChannel = async (channelName, headers) =>
	await axios
	.post(
		apiEndpoints.deletechannelurl, {
			roomName: channelName,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('DELETE_CHANNEL.SUCCESS', {
				channelName
			});
		} else {
			return ri('DELETE_CHANNEL.ERROR', {
				channelName
			});
		}
	})
	.catch((err) => {
		console.log(err.message);
		if (err.response.data.errorType === 'error-room-not-found') {
			return ri('DELETE_CHANNEL.ERROR_NOT_FOUND', {
				channelName
			});
		} else {
			return ri('DELETE_CHANNEL.ERROR', {
				channelName
			});
		}
	});

const postMessage = async (channelName, message, headers) =>
	await axios
	.post(
		apiEndpoints.postmessageurl, {
			channel: `#${ channelName }`,
			text: message,
		}, {
			headers
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

const channelLastMessage = async (channelName, headers) =>
	await axios
	.get(`${ apiEndpoints.channelmessageurl }${ channelName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('GET_LAST_MESSAGE_FROM_CHANNEL.SUCCESS', {
				name: res.messages[0].u.username,
				message: res.messages[0].msg,
			}
		)
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
		} else {
			return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', {
				channelName,
			});
		}
	});

const readMessages = async (roomid,headers) =>
	await axios
	.post(apiEndpoints.markasreadurl, {
		rid: roomid,
	}, {
		headers
	})
	.then((res) => {
		console.log(res.data);
	})
	.catch((err) => {
		console.log(err.message);
	});

const getLastMessageFileURL = async (channelName, headers) =>
	await axios
	.get(`${ apiEndpoints.channelmessageurl }${ channelName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => `https://bots.rocket.chat/file-upload/${ res.messages[0].file._id }/${res.messages[0].file.name}`)
	.catch((err) => {
		console.log(err.message);
	});

const getLastMessageFileDowloadURL = async (fileurl, headers) =>
	await axios
	.get(fileurl, {
		headers
	})
	.then((response) => `${ response.request.res.responseUrl }`)
	.catch((err) => {
		console.log(err.message);
	});

const getUnreadCounter = async (channelName, headers) =>
	await axios
	.get(`${ apiEndpoints.counterurl }${ channelName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => `${ res.unreads }`)
	.catch((err) => {
		console.log(err.message);
	});

//PLEASE DO NOT REFACTOR CHANNELUNREADMESSAGES FUNCTION
const channelUnreadMessages = async (channelName, unreadCount, headers) =>
	await axios
	.get(`${ apiEndpoints.channelmessageurl }${ channelName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			if (unreadCount === 0) {
				return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE');
			} else {
				const msgs = [];

				for (let i = 0; i <= unreadCount - 1; i++) {
					msgs.push(`${res.messages[i].u.username} says, ${res.messages[i].msg} <break time="0.7s"/> `);
				}

				var responseString = msgs.join(', ');

				var finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.MESSAGE', {
					respString: responseString,
					unread: unreadCount
				});

				return finalMsg;
			}
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
		} else {
			return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR', {
				channelName,
			});
		}
	});

const getUserId = async (userName, headers) =>
	await axios
	.get(`${ apiEndpoints.userinfourl }${ userName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => `${ res.user._id }`)
	.catch((err) => {
		console.log(err.message);
	});

const getRoomId = async (channelName, headers) =>
	await axios
	.get(`${ apiEndpoints.channelinfourl }${ channelName }`, {
		headers
	})
	.then((res) => res.data)
	.then((res) => `${ res.channel._id }`)
	.catch((err) => {
		console.log(err.message);
	});

const makeModerator = async (userName, channelName, userid, roomid, headers) =>
	await axios
	.post(
		apiEndpoints.makemoderatorurl, {
			userId: userid,
			roomId: roomid,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('MAKE_MODERATOR.SUCCESS', {
				userName,
				channelName
			});
		} else {
			return ri('MAKE_MODERATOR.ERROR');
		}
	})
	.catch((err) => {
		console.log(err.message);
		return ri('MAKE_MODERATOR.ERROR_NOT_FOUND', {
			channelName
		});
	});

const addAll = async (channelName, roomid, headers) =>
	await axios
	.post(
		apiEndpoints.addallurl, {
			roomId: roomid,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('ADD_ALL_TO_CHANNEL.SUCCESS', {
				channelName
			});
		} else {
			return ri('ADD_ALL_TO_CHANNEL.ERROR');
		}
	})
	.catch((err) => {
		console.log(err.message);
		return ri('ADD_ALL_TO_CHANNEL.ERROR_NOT_FOUND', {
			channelName
		});
	});

const addOwner = async (userName, channelName, userid, roomid, headers) =>
	await axios
	.post(
		apiEndpoints.addownerurl, {
			userId: userid,
			roomId: roomid,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('ADD_OWNER.SUCCESS', {
				userName,
				channelName
			});
		} else {
			return ri('ADD_OWNER.ERROR');
		}
	})
	.catch((err) => {
		console.log(err.message);
		return ri('ADD_OWNER.ERROR_NOT_FOUND', {
			channelName
		});
	});

const archiveChannel = async (channelName, roomid, headers) =>
	await axios
	.post(
		apiEndpoints.archivechannelurl, {
			roomId: roomid,
		}, {
			headers
		}
	)
	.then((res) => res.data)
	.then((res) => {
		if (res.success === true) {
			return ri('ARCHIVE_CHANNEL.SUCCESS', {
				channelName
			});
		} else {
			return ri('ARCHIVE_CHANNEL.ERROR');
		}
	})
	.catch((err) => {
		console.log(err.message);
		return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', {
			channelName
		});
	});

function replaceWhitespacesFunc(str) {
	return removeWhitespace(str);
}

function replaceWhitespacesDots(str) {
	return str.replace(/\s/ig, '.');
}

function emojiTranslateFunc(str) {
	onlyEmoji = true;
	return emojiTranslate.translate(str, onlyEmoji);
}



// Module Export of Functions

module.exports.login = login;
module.exports.createChannel = createChannel;
module.exports.deleteChannel = deleteChannel;
module.exports.postMessage = postMessage;
module.exports.channelLastMessage = channelLastMessage;
module.exports.getLastMessageFileURL = getLastMessageFileURL;
module.exports.getLastMessageFileDowloadURL = getLastMessageFileDowloadURL;
module.exports.getUserId = getUserId;
module.exports.getRoomId = getRoomId;
module.exports.makeModerator = makeModerator;
module.exports.addAll = addAll;
module.exports.addOwner = addOwner;
module.exports.archiveChannel = archiveChannel;
module.exports.getUnreadCounter = getUnreadCounter;
module.exports.channelUnreadMessages = channelUnreadMessages;
module.exports.replaceWhitespacesFunc = replaceWhitespacesFunc;
module.exports.replaceWhitespacesDots = replaceWhitespacesDots;
module.exports.emojiTranslateFunc = emojiTranslateFunc;
module.exports.readMessages = readMessages;