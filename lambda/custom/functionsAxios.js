
const axios = require('axios');
const endpoints = require('./endpoints');

//Server Credentials. Follow readme to set them up.
const oauthServiceNname = process.env.OAUTH_SERVICE_NAME;


//Axios Functions

const login = async (accessToken) => {
  return await axios.post(endpoints.loginUrl,
    {
      "serviceName": oauthServiceNname,
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
  return await axios.post(endpoints.createchannelurl,
    {
      "name": channelName
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `I've created your channel ${channelName}`;
      }
      else{
        return `Sorry, I couldn't create the channel ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      if(err.response.data.errorType == `error-duplicate-channel-name`){
        return `Sorry, the channel ${channelName} already exists. Please try again with different channel name.`;
      }
      else if(err.response.data.errorType == `error-invalid-room-name`){
        return `Sorry, ${channelName} is not a valid channel name. Please try again with a single word name for the channel`;
      }
      else{
        return `Sorry, I couldn't create the channel ${channelName} right now`;
      }
    });
};

const deleteChannel = async (channelName, headers) => {
  return await axios.post(endpoints.deletechannelurl,
    {
      "roomName": channelName
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `I've deleted the channel ${channelName}`;
      }
      else{
        return `Sorry, I couldn't delete the channel ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      if(err.response.data.errorType == `error-room-not-found`){
        return `Sorry, the channel ${channelName} does not exist. Please try again with different channel name.`;
      }
      else{
        return `Sorry, I couldn't delete the channel ${channelName} right now`;
      }
    });
};

const postMessage = async (channelName, message, headers) => {
  return await axios.post(endpoints.postmessageurl,
    {
      "channel": `#${channelName}`,
      "text": message
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `I've sent your message`;
      }
      else{
        return `Sorry, I couldn't send your message right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      return `Sorry, I couldn't send your message right now`;
    });
};

const channelLastMessage = async (channelName, headers) => {
  return await axios.get(`${endpoints.channelmessageurl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `${res.messages[0].u.name} says, ${res.messages[0].msg}`;
      }
      else{
        return `Sorry, I couldn't find the channel ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      if(err.response.data.errorType == `error-room-not-found`){
        return `Sorry, the channel ${channelName} does not exist. Please try again with different channel name.`;
      }
      else{
        return `Sorry, I couldn't find the channel ${channelName} right now`;
      }
    });
};

const getUserId = async (userName, headers) => {
  return await axios.get(`${endpoints.userinfourl}${userName}`,
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
  return await axios.get(`${endpoints.channelinfourl}${channelName}`,
    { headers: headers })
    .then(res => res.data)
    .then(res => {
        return `${res.channel._id}`;
    })
    .catch(err => {
      console.log(err.message);
    });
};

const makeModerator = async (userName,channelName,userid, roomid, headers) => {
  return await axios.post(endpoints.makemoderatorurl,
    {
      "userId": userid,
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `${userName} is now the moderator of ${channelName}`;
      }
      else{
        return `Sorry, I couldn't assign a moderator to ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      
      return `Sorry, I couldn't assign a moderator right now`;
      
    });
};

const addAll = async (channelName,roomid, headers) => {
  return await axios.post(endpoints.addallurl,
    {
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `Added All Users To ${channelName}`;
      }
      else{
        return `Sorry, I am unable to add all users to ${channelName}`;
      }
    })
    .catch(err => {
      console.log(err.message);
        return `Sorry, I am unable to add all users to ${channelName}`;
    });
};


const addOwner = async (userName,channelName,userid, roomid, headers) => {
  return await axios.post(endpoints.addownerurl,
    {
      "userId": userid,
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `${userName} is now the owner of ${channelName}`;
      }
      else{
        return `Sorry, I couldn't assign a owner to ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      
      return `Sorry, I couldn't assign a owner right now`;
      
    });
};

const archiveChannel = async (channelName,roomid, headers) => {
  return await axios.post(endpoints.archivechannelurl,
    {
      "roomId": roomid
    },
    { headers: headers })
    .then(res => res.data)
    .then(res => {
      if(res.success == true){
        return `${channelName} is now Archived`;
      }
      else{
        return `Sorry, I couldn't archive ${channelName} right now`;
      }
    })
    .catch(err => {
      console.log(err.message);
      
      return `Sorry, I couldn't archive this channel right now`;
      
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
