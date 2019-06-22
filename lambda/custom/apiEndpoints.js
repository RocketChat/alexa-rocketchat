const envVariables = require('./config');

// Server URL Environment Variable

const { serverurl } = envVariables;


// REST API Endpoints

module.exports = {
	loginUrl: `${ serverurl }/api/v1/login`,
	meUrl: `${ serverurl }/api/v1/me`,
	createchannelurl: `${ serverurl }/api/v1/channels.create`,
	deletechannelurl: `${ serverurl }/api/v1/channels.delete`,
	postmessageurl: `${ serverurl }/api/v1/chat.postMessage`,
	channelmessageurl: `${ serverurl }/api/v1/channels.messages?roomName=`,
	channelinfourl: `${ serverurl }/api/v1/channels.info?roomName=`,
	userinfourl: `${ serverurl }/api/v1/users.info?username=`,
	addallurl: `${ serverurl }/api/v1/channels.addAll`,
	makemoderatorurl: `${ serverurl }/api/v1/channels.addModerator`,
	addownerurl: `${ serverurl }/api/v1/channels.addOwner`,
	archivechannelurl: `${ serverurl }/api/v1/channels.archive`,
	counterurl: `${ serverurl }/api/v1/channels.counters?roomName=`,
	markasreadurl: `${ serverurl }/api/v1/subscriptions.read`,
	generatetokenurl: `${ serverurl }/api/v1/users.generatePersonalAccessToken`,
	removetokenurl: `${ serverurl }/api/v1/users.removePersonalAccessToken`,
	anonymousReadUrl: `${ serverurl }/api/v1/channels.anonymousread?roomName=`,
	creategroupurl: `${ serverurl }/api/v1/groups.create`,
	deletegroupurl: `${ serverurl }/api/v1/groups.delete`,
	groupinfourl: `${ serverurl }/api/v1/groups.info?roomName=`,
	addgroupmoderatorurl: `${ serverurl }/api/v1/groups.addModerator`,
	addgroupownerurl: `${ serverurl }/api/v1/groups.addOwner`,
	postmessageurl: `${ serverurl }/api/v1/chat.postMessage`,
	groupmessageurl: `${ serverurl }/api/v1/groups.messages?roomId=`,
	groupcounterurl: `${ serverurl }/api/v1/groups.counters?roomId=`,
	createimurl: `${ serverurl }/api/v1/im.create`,
};
