/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const axios = require('axios');

//Server Credentials. Follow readme to set them up.
const serverurl = process.env.SERVER_URL;
const oauthServiceNname = process.env.OAUTH_SERVICE_NAME;

//REST API Endpoints


const loginUrl = `${serverurl}/api/v1/login`;
const createchannelurl = `${serverurl}/api/v1/channels.create`;
const deletechannelurl = `${serverurl}/api/v1/channels.delete`;
const postmessageurl = `${serverurl}/api/v1/chat.postMessage`;
const channelmessageurl = `${serverurl}/api/v1/channels.messages?roomName=`;
const channelinfourl = `${serverurl}/api/v1/channels.info?roomName=`;
const userinfourl = `${serverurl}/api/v1/users.info?username=`;
const addallurl = `${serverurl}/api/v1/channels.addAll`;
const makemoderatorurl = `${serverurl}/api/v1/channels.addModerator`;
const addownerurl = `${serverurl}/api/v1/channels.addOwner`;
const archivechannelurl = `${serverurl}/api/v1/channels.archive`;


//Axios Functions

const login = async (accessToken) => {
  return await axios.post(loginUrl,
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
}

const createChannel = async (channelName, headers) => {
  return await axios.post(createchannelurl,
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
  return await axios.post(deletechannelurl,
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
  return await axios.post(postmessageurl,
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
  return await axios.get(`${channelmessageurl}${channelName}`,
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

const getUserInfo = async (username0) => {
  try {
    const { data } = await axios({
      method: 'get',
      url: userinfourl + username0,
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot get channel message', error);
    return error;
  }
};

const getRoomInfo = async (channelname0) => {
  try {
    const { data } = await axios({
      method: 'get',
      url: channelinfourl + channelname0,
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot get channel message', error);
    return error;
  }
};


const addAll = async (roomid) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: addallurl,
      data: {
        roomId: roomid
      },
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot add all', error);
    return error;
  }
};

const makeModerator = async (userid, roomid) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: makemoderatorurl,
      data: {
        userId: userid,
        roomId: roomid
      },
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot make moderator', error);
    return error;
  }
};

const addOwner = async (userid, roomid) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: addownerurl,
      data: {
        userId: userid,
        roomId: roomid
      },
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot make owner', error);
    return error;
  }
};

const archiveChannel = async (roomid) => {
  try {
    const { data } = await axios({
      method: 'post',
      url: archivechannelurl,
      data: {
        roomId: roomid
      },
      headers: headers
    });
    return data;
  } catch (error) {
    console.error('cannot archive channel', error);
    return error;
  }
};



//Alexa Intent Functions

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {

    if (handlerInput.requestEnvelope.context.System.user.accessToken === undefined) {

      const speechText = `To start using this skill, please use the companion app to authenticate.`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }
    const speechText = `Welcome To Rocket Chat Alexa Skill. What Would you like to do today ?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Welcome To Rocket.Chat', speechText)
      .getResponse();

  },
};

const CreateChannelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CreateChannelIntent';
  },
  async handle(handlerInput) {
    try {
      let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

      let channelName = handlerInput.requestEnvelope.request.intent.slots.channelname.value;

      const headers = await login(accessToken);
      const speechText = await createChannel(channelName, headers);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Create A Channel', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const DeleteChannelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DeleteChannelIntent';
  },
  async handle(handlerInput) {
    try {
      let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

      let channelName = handlerInput.requestEnvelope.request.intent.slots.channeldelete.value;

      const headers = await login(accessToken);
      const speechText = await deleteChannel(channelName, headers);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Delete A Channel', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const PostMessageIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PostMessageIntent';
  },
  async handle(handlerInput) {
    try {
      let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

      let message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
      let channelName = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;

      const headers = await login(accessToken);
      const speechText = await postMessage(channelName, message, headers);


      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Post A Message', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const GetLastMessageFromChannelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetLastMessageFromChannel';
  },
  async handle(handlerInput) {
    try {
      let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

      let channelName = handlerInput.requestEnvelope.request.intent.slots.getmessagechannelname.value;

      const headers = await login(accessToken);
      const speechText = await channelLastMessage(channelName, headers);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Channel Message', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const AddAllToChannelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddAllToChannelIntent';
  },
  async handle(handlerInput) {
    try {


      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.addallchannelname.value;

      const login0 = await login();
      const channelinfodata = await getRoomInfo(channelname0);
      const roomid = channelinfodata.channel._id;
      const addalldata = await addAll(roomid);

      const speechText = ` ${addalldata.success} `;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Add All To Server', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const MakeModeratorIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MakeModeratorIntent';
  },
  async handle(handlerInput) {
    try {

      var username0 = handlerInput.requestEnvelope.request.intent.slots.moderatorusername.value;
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.moderatorchannelname.value;

      const login0 = await login();
      const userinfodata = await getUserInfo(username0);
      const channelinfodata = await getRoomInfo(channelname0);
      const userid = userinfodata.user._id;
      const roomid = channelinfodata.channel._id;
      const makemoderatordata = await makeModerator(userid, roomid);

      const speechText = ` ${makemoderatordata.success} `;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Make Moderator', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const AddOwnerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddOwnerIntent';
  },
  async handle(handlerInput) {
    try {

      var username0 = handlerInput.requestEnvelope.request.intent.slots.ownerusername.value;
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.ownerchannelname.value;

      const login0 = await login();
      const userinfodata = await getUserInfo(username0);
      const channelinfodata = await getRoomInfo(channelname0);
      const userid = userinfodata.user._id;
      const roomid = channelinfodata.channel._id;
      const addownerdata = await addOwner(userid, roomid);

      const speechText = ` ${addownerdata.success} `;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Add Owner', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const ArchiveChannelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ArchiveChannelIntent';
  },
  async handle(handlerInput) {
    try {

      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.archivechannelname.value;

      const login0 = await login();
      const channelinfodata = await getRoomInfo(channelname0);
      const roomid = channelinfodata.channel._id;
      const archivechanneldata = await archiveChannel(roomid);

      const speechText = ` ${archivechanneldata.success} `;

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Archive Channel', speechText)
        .reprompt(speechText)
        .getResponse();
    } catch (error) {
      console.error(error);
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This is the Alexa Skill for rocket chat. Refer sample utterances file on GitHub.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Rocket Chat', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Rocket Chat', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CreateChannelIntentHandler,
    DeleteChannelIntentHandler,
    PostMessageIntentHandler,
    GetLastMessageFromChannelIntentHandler,
    AddAllToChannelIntentHandler,
    MakeModeratorIntentHandler,
    AddOwnerIntentHandler,
    ArchiveChannelIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();