// Environment Variables

module.exports = {
	serverurl: process.env.SERVER_URL,
	oauthServiceName: process.env.OAUTH_SERVICE_NAME,
	dynamoDBTableName: process.env.DDB_NAME,
};

if(process.env.DEVELOPMENT){
	module.exports = {
		serverurl: "https://bots.rocket.chat/",
		oauthServiceName: "alexaskill",
		dynamoDBTableName: "alexa",
	};	
}