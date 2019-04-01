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
const channelinfourl = `${serverurl}/v1/channels.info?roomName=`;
const userinfourl = `${serverurl}/api/v1/users.info?username=`;
const makeleaderurl = `${serverurl}/api/v1/channels.addLeader`;

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

const CreateChannelHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'createchannel';
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

const DeleteChannelHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'deletechannel';
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

const PostMessageHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'postmessage';
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

const ChannelMessageHandler = {
  canHandle(handlerInput) {
     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'channelmessage';
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


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'Yet To Write Help Instructions';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Inspiration', speechText)
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
      .withSimpleCard('Inspiration', speechText)
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
    CreateChannelHandler,
    DeleteChannelHandler,
    PostMessageHandler,
    ChannelMessageHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
