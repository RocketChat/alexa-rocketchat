/* eslint-disable  func-names */
/* eslint-disable  no-console */


const Alexa = require('ask-sdk-core');
const axios = require('axios');

//User Credentials
const username0 = '';
const password0 = '';
const authtoken0 = '';
const userid0 = '';

//REST API Endpoints

const serverurl = process.env.SERVER_URL;

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
const login = async () => {
  try {
    const { logindata } = await axios.post(loginUrl, {name: username0, password: password0});
    return logindata;
  } catch (loginerror) {
    console.error('cannot fetch quotes', loginerror);
  }
};

var headers = {
            'X-Auth-Token': authtoken0, 
            'X-User-Id': userid0
            };

const createChannel = async (channelname0) => {
  try {
    const { data } = await axios({
  method: 'post',
  url: createchannelurl,
  data: {
    name : channelname0
  },
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot create channel', error);
    return error;
  }
};

const deleteChannel = async (channelname0) => {
  try {
    const { data } = await axios({
  method: 'post',
  url: deletechannelurl,
  data: {
    roomName : channelname0
  },
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot delete channel', error);
    return error;
  }
};

const postMessage = async (channelname0,message) => {
  try {
    const { data } = await axios({
  method: 'post',
  url: postmessageurl,
  data: {
    channel : '#'+channelname0,
    text: message
  },
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot post message', error);
    return error;
  }
};

const channelMessage = async (channelname0) => {
  try {
    const { data } = await axios({
  method: 'get',
  url: channelmessageurl+channelname0,
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot get channel message', error);
    return error;
  }
};

const getUserInfo = async (username0) => {
  try {
    const { data } = await axios({
  method: 'get',
  url: userinfourl+username0,
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
  url: channelinfourl+channelname0,
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
    roomId : roomid
  },
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot add all', error);
    return error;
  }
};

const makeModerator = async (userid,roomid) => {
  try {
    const { data } = await axios({
  method: 'post',
  url: makemoderatorurl,
  data: {
    userId : userid,
    roomId : roomid
  },
  headers: headers
});
    return data;
  } catch (error) {
    console.error('cannot make moderator', error);
    return error;
  }
};

const addOwner = async (userid,roomid) => {
  try {
    const { data } = await axios({
  method: 'post',
  url: addownerurl,
  data: {
    userId : userid,
    roomId : roomid
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
    roomId : roomid
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
    
      const speechText = `Welcome To Rocket.Chat Alexa Skill. What Would you like to do today ?`;

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
      
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.channelname.value;
      
      const login0 = await login();
      const rawdata = await createChannel(channelname0);
      
      const speechText = ` ${rawdata.success} `;

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
      
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.channeldelete.value;
      
      const login0 = await login();
      const rawdata = await deleteChannel(channelname0);
      
      const speechText = ` ${rawdata.success} `;

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
      
      var message = handlerInput.requestEnvelope.request.intent.slots.messagepost.value;
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.messagechannel.value;
      
      const login0 = await login();
      const rawdata = await postMessage(channelname0,message);
      
      const speechText = ` ${rawdata.success} `;

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

const ChannelMessageIntentHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ChannelMessageIntent';
  },
  async handle(handlerInput) {
    try {
      
      var channelname0 = handlerInput.requestEnvelope.request.intent.slots.getmessagechannelname.value;
      
      const login0 = await login();
      const rawdata = await channelMessage(channelname0);
      
      const speechText = ` ${rawdata.messages[0].u.username} says ${rawdata.messages[0].msg} `;

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
      const makemoderatordata = await makeModerator(userid,roomid);
      
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
      const addownerdata = await addOwner(userid,roomid);
      
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
    ChannelMessageIntentHandler,
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