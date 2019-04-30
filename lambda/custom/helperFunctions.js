const axios = require('axios');
const apiEndpoints = require('./apiEndpoints');
const envVariables = require('./config');

const Jargon = require('@jargon/alexa-skill-sdk')
const ri = Jargon.ri

//Server Credentials. Follow readme to set them up.
const oauthServiceName = envVariables.oauthServiceName;


//Axios Functions

const login = async (accessToken) => {
  return await axios.post(apiEndpoints.loginUrl,
    {
      "serviceName": oauthServiceName,
      "accessToken": accessToken,
      "expiresIn": 200
    })
    .then(res => res.data)
    .then(res => {
      console.log(res);
      let headers = {
        'X-Auth-Token': res.data.authToken,
        'X-User-Id': res.data.userId
      };
      return headers;
    })
    .catch(err => {
      console.log(err);
    });
};

const createChannel = async (channelName, headers) => {
  return await axios.post(apiEndpoints.createchannelurl,
    {
      "name": channelName
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('CREATE_CHANNEL.SUCCESS', { channelName: channelName });
      }
      else {
        return ri('CREATE_CHANNEL.ERROR', { channelName: channelName });
      }
    })
    .catch(err => {
      console.log(err.message);
      if (err.response.data.errorType == `error-duplicate-channel-name`) {
        return ri('CREATE_CHANNEL.ERROR_DUPLICATE_NAME', { channelName: channelName });
      }
      else if (err.response.data.errorType == `error-invalid-room-name`) {
        return ri('CREATE_CHANNEL.ERROR_INVALID_NAME', { channelName: channelName });
      }
      else {
        return ri('CREATE_CHANNEL.ERROR', { channelName: channelName });
      }
    });
};

const deleteChannel = async (channelName, headers) => {
  return await axios.post(apiEndpoints.deletechannelurl,
    {
      "roomName": channelName
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('DELETE_CHANNEL.SUCCESS', { channelName: channelName });
      }
      else {
        return ri('DELETE_CHANNEL.ERROR', { channelName: channelName });
      }
    })
    .catch(err => {
      console.log(err.message);
      if (err.response.data.errorType == `error-room-not-found`) {
        return ri('DELETE_CHANNEL.ERROR_NOT_FOUND', { channelName: channelName });
      }
      else {
        return ri('DELETE_CHANNEL.ERROR', { channelName: channelName });
      }
    });
};

const postMessage = async (channelName, message, headers) => {
  return await axios.post(apiEndpoints.postmessageurl,
    {
      "channel": `#${channelName}`,
      "text": message
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('POST_MESSAGE.SUCCESS');
      }
      else {
        return ri('POST_MESSAGE.ERROR');
      }
    })
    .catch(err => {
      console.log(err.message);
      return ri('POST_MESSAGE.ERROR');
    });
};

const channelLastMessage = async (channelName, headers) => {
  return await axios.get(`${apiEndpoints.channelmessageurl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('GET_LAST_MESSAGE_FROM_CHANNEL.SUCCESS', { name: res.messages[0].u.name, message: res.messages[0].msg });
      }
      else {
        return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', { channelName: channelName });
      }
    })
    .catch(err => {
      console.log(err.message);
      if (err.response.data.errorType == `error-room-not-found`) {
        return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR_NOT_FOUND', { channelName: channelName });
      }
      else {
        return ri('GET_LAST_MESSAGE_FROM_CHANNEL.ERROR', { channelName: channelName });
      }
    });
};

const getUnreadCounter = async (channelName, headers) => {
  return await axios.get(`${apiEndpoints.counterurl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      return `${res.unreads}`;
    })
    .catch(err => {
      console.log(err.message);
    });
};

const channelUnreadMessages = async (channelName, unreadCount, headers) => {
  return await axios.get(`${apiEndpoints.channelmessageurl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {

        if (unreadCount == 0) {

          return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.NO_MESSAGE');

        }

        else {

          var array = [];
          
          for (var i = 0; i <= unreadCount-1; i++) {
                  array.push(`${res.messages[i].u.username} says, ${res.messages[i].msg} <break time="0.7s"/> `);
                }
          
          var responseString = array.join(', ');
          
          var finalMsg = ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.MESSAGE', { respString: responseString, unread:unreadCount });

          return finalMsg;
          

        }
      }
      else {
        return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR', { channelName: channelName });
      }
    })
    .catch(err => {
      console.log(err.message);
      if (err.response.data.errorType == `error-room-not-found`) {
        return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR_NOT_FOUND', { channelName: channelName });
      }
      else {
        return ri('GET_UNREAD_MESSAGES_FROM_CHANNEL.ERROR', { channelName: channelName });
      }
    });
};

const getUserId = async (userName, headers) => {
  return await axios.get(`${apiEndpoints.userinfourl}${userName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      return `${res.user._id}`;
    })
    .catch(err => {
      console.log(err.message);
    });
};

const getRoomId = async (channelName, headers) => {
  return await axios.get(`${apiEndpoints.channelinfourl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      return `${res.channel._id}`;
    })
    .catch(err => {
      console.log(err.message);
    });
};

const makeModerator = async (userName, channelName, userid, roomid, headers) => {
  return await axios.post(apiEndpoints.makemoderatorurl,
    {
      "userId": userid,
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('MAKE_MODERATOR.SUCCESS', { userName: userName, channelName: channelName });
      }
      else {
        return ri('MAKE_MODERATOR.ERROR');
      }
    })
    .catch(err => {
      console.log(err.message);
      return ri('MAKE_MODERATOR.ERROR_NOT_FOUND', { channelName: channelName });
    });
};

const addAll = async (channelName, roomid, headers) => {
  return await axios.post(apiEndpoints.addallurl,
    {
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('ADD_ALL_TO_CHANNEL.SUCCESS', { channelName: channelName });
      }
      else {
        return ri('ADD_ALL_TO_CHANNEL.ERROR');
      }
    })
    .catch(err => {
      console.log(err.message);
      return ri('ADD_ALL_TO_CHANNEL.ERROR_NOT_FOUND', { channelName: channelName });
    });
};


const addOwner = async (userName, channelName, userid, roomid, headers) => {
  return await axios.post(apiEndpoints.addownerurl,
    {
      "userId": userid,
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('ADD_OWNER.SUCCESS', { userName: userName, channelName: channelName });
      }
      else {
        return ri('ADD_OWNER.ERROR');
      }
    })
    .catch(err => {
      console.log(err.message);
      return ri('ADD_OWNER.ERROR_NOT_FOUND', { channelName: channelName });

    });
};

const archiveChannel = async (channelName, roomid, headers) => {
  return await axios.post(apiEndpoints.archivechannelurl,
    {
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if (res.success == true) {
        return ri('ARCHIVE_CHANNEL.SUCCESS', { channelName: channelName });
      }
      else {
        return ri('ARCHIVE_CHANNEL.ERROR');
      }
    })
    .catch(err => {
      console.log(err.message);
      return ri('ARCHIVE_CHANNEL.ERROR_NOT_FOUND', { channelName: channelName });

    });
};




//Module Export of Functions

module.exports.login = login;
module.exports.createChannel = createChannel;
module.exports.deleteChannel = deleteChannel;
module.exports.postMessage = postMessage;
module.exports.channelLastMessage = channelLastMessage;
module.exports.getUserId = getUserId;
module.exports.getRoomId = getRoomId;
module.exports.makeModerator = makeModerator;
module.exports.addAll = addAll;
module.exports.addOwner = addOwner;
module.exports.archiveChannel = archiveChannel;
module.exports.getUnreadCounter = getUnreadCounter;
module.exports.channelUnreadMessages = channelUnreadMessages;
