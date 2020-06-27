const envVariables = require('./config');

// Server URL Environment Variable

const { serverurl } = envVariables;


// REST API Endpoints

module.exports = {
	loginUrl: `${ serverurl }/api/v1/login`,
	meUrl: `${ serverurl }/api/v1/me`,
	channellisturl: `${ serverurl }/api/v1/channels.list.joined`,
	grouplisturl: `${ serverurl }/api/v1/groups.list`,
	createchannelurl: `${ serverurl }/api/v1/channels.create`,
	deletechannelurl: `${ serverurl }/api/v1/channels.delete`,
	postmessageurl: `${ serverurl }/api/v1/chat.postMessage`,
	channelmessageurl: `${ serverurl }/api/v1/channels.messages?roomName=`,
	channelinfourl: `${ serverurl }/api/v1/channels.info?roomName=`,
	userinfourl: `${ serverurl }/api/v1/users.info?username=`,
	addallurl: `${ serverurl }/api/v1/channels.addAll`,
	archivechannelurl: `${ serverurl }/api/v1/channels.archive`,
	counterurl: `${ serverurl }/api/v1/channels.counters?roomName=`,
	markasreadurl: `${ serverurl }/api/v1/subscriptions.read`,
	generatetokenurl: `${ serverurl }/api/v1/users.generatePersonalAccessToken`,
	removetokenurl: `${ serverurl }/api/v1/users.removePersonalAccessToken`,
	anonymousReadUrl: `${ serverurl }/api/v1/channels.anonymousread?roomName=`,
	creategroupurl: `${ serverurl }/api/v1/groups.create`,
	deletegroupurl: `${ serverurl }/api/v1/groups.delete`,
	groupinfourl: `${ serverurl }/api/v1/groups.info?roomName=`,
	groupmessageurl: `${ serverurl }/api/v1/groups.messages?roomId=`,
	groupcounterurl: `${ serverurl }/api/v1/groups.counters?roomId=`,
	createimurl: `${ serverurl }/api/v1/im.create`,
	getsubscriptionsurl: `${ serverurl }/api/v1/subscriptions.get`,
	addleadertochannelurl: `${ serverurl }/api/v1/channels.addLeader`,
	addleadertogroupurl: `${ serverurl }/api/v1/groups.addLeader`,
	addownertochannelurl: `${ serverurl }/api/v1/channels.addOwner`,
	addownertogroupurl: `${ serverurl }/api/v1/groups.addOwner`,
	addmoderatortochannelurl: `${ serverurl }/api/v1/channels.addModerator`,
	addmoderatortogroupurl: `${ serverurl }/api/v1/groups.addModerator`,
	removeleaderfromchannelurl: `${ serverurl }/api/v1/channels.removeLeader`,
	removeleaderfromgroupurl: `${ serverurl }/api/v1/groups.removeLeader`,
	removeownerfromchannelurl: `${ serverurl }/api/v1/channels.removeOwner`,
	removeownerfromgroupurl: `${ serverurl }/api/v1/groups.removeOwner`,
	removemoderatorfromchannelurl: `${ serverurl }/api/v1/channels.removeModerator`,
	removemoderatorfromgroupurl: `${ serverurl }/api/v1/groups.removeModerator`,
	getrolesfromchannelurl: `${ serverurl }/api/v1/channels.roles`,
	getrolesfromgroupurl: `${ serverurl }/api/v1/groups.roles`,
	leavechannelurl: `${ serverurl }/api/v1/channels.leave`,
	leavegroupurl: `${ serverurl }/api/v1/groups.leave`,
};
