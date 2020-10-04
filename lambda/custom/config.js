// Environment Variables
if (process.env.DEVELOPMENT) { require('dotenv').config(); }

module.exports = {
	serverurl: process.env.SERVER_URL,
	oauthServiceName: process.env.OAUTH_SERVICE_NAME,
	dynamoDBTableName: process.env.DDB_NAME,
	awsAccessKeyId: process.env.ACCESS_KEY_ID,
	awsSecretAccessKey: process.env.SECRET_ACCESS_KEY,
	customLogUrl: process.env.CUSTOM_LOG_URL || '',
	// the below configurations are used in resolve channelname and username helper functions
	// the minimum rating which a name has to achieve to be considered as similar
	lowestSimilarityIndex: 0.3,
	lowerSimilarityIndex: 0.5,
	// a name is considered as best match on passing the below index
	upperSimilarityIndex: 0.7,
};
