// Environment Variables
if(process.env.DEVELOPMENT) require('dotenv').config()

module.exports = {
	serverurl: process.env.SERVER_URL,
	oauthServiceName: process.env.OAUTH_SERVICE_NAME,
	dynamoDBTableName: process.env.DDB_NAME,
	awsAccessKeyId: process.env.ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.SECRET_ACCESS_KEY,
	customLogUrl: process.env.CUSTOM_LOG_URL || "",
	lowerSimilarityIndex: 0.5,
	upperSimilarityIndex: 0.7
};
