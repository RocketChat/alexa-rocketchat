<p align="center">
  <img  src="https://user-images.githubusercontent.com/41849970/57236777-691ae200-7043-11e9-8d8e-67e05e60a8e4.png">
</p>

<h3 align="center">
  Innovating Incredible New User Experiences In The Alexa Ecosystem
</h3>

---

# Let's Get Started

**Note:** The rest of this readme assumes you have your developer environment ready to go and that you have some familiarity with CLI (Command Line Interface) Tools, [AWS](https://aws.amazon.com/), and the [ASK Developer Portal](https://developer.amazon.com/alexa-skills-kit).

### Repository Contents
* `/.ask`	- [ASK CLI (Command Line Interface) Configuration](https://developer.amazon.com/docs/smapi/ask-cli-intro.html)	 
* `/lambda/custom` - Back-End Logic for the Alexa Skill hosted on [AWS Lambda](https://aws.amazon.com/lambda/)
* `/lambda/custom/resources` - Language specific speech response
* `/models` - Voice User Interface and Language Specific Interaction Models
* `skill.json`	- [Skill Manifest](https://developer.amazon.com/docs/smapi/skill-manifest.html)


## Setup w/ ASK CLI

### Pre-requisites

* Node.js (> v8.10)
* Register for an [AWS Account](https://aws.amazon.com/)
* Register for an [Amazon Developer Account](https://developer.amazon.com/)
* Install and Setup [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)
* Rocket Chat Server updated to [Release 1.0.0-rc3](https://github.com/RocketChat/Rocket.Chat/releases/tag/1.0.0-rc.3) or later


### Installation
1. Clone the repository.

	```bash
	$ git clone https://github.com/RocketChat/alexa-rocketchat.git
	```

2. Navigating into the repository's root folder.

	```bash
	$ cd alexa-rocketchat
	```

3. Install npm dependencies by navigating into the `lambda/custom` directory and running the npm command: `npm install`

	```bash
	$ cd lambda/custom
	$ npm install
	```
	
### Deployment

ASK CLI will create the skill and the lambda function for you. The Lambda function will be created in ```us-east-1 (Northern Virginia)``` by default.

1. Make sure you are at your `alexa-rocketchat` top level project directory, then deploy the skill and the lambda function in one step by running the following command:

	```bash
	$ ask deploy
	```
	
2. After Deploying go to lambda console and set Environment variables values. 
	
	e.g: 
	1. **SERVER_URL**    https://yourservername.rocket.chat
	2. **OAUTH_SERVICE_NAME**    (The name of the Custom OAuth you setup in next step)
	
### Configuring Account Linking

1. Login to Alexa Developer Console, click on the Rocket.Chat skill on the list, and go to Build section on top.

2. Click on Account Linking on the bottom left.

3. Toggle the *Do you allow users to create an account or link to an existing account with you?* button. Leave *Allow users to enable skill without account linking* as it is. Select auth code grant. 

4. Now we need to fill up the *Authorization URI, Access Token URI, Client ID, Client Secret* which we will generate on our rocket chat server.

5. **Note you need to be admin of the server to proceed with the further steps.**

6. In a new tab go to your **Server -> Three Dot Menu -> Administration**.

![Go to Server -> Administration](https://i.ibb.co/wgJnBxD/diagram1.jpg)

7. Click on **OAuth Apps**.

![Click on OAuth Apps](https://i.ibb.co/Wp2P42k/diagram2.jpg)

8. Click on **New Application** on top right. Now we need to give it an *Application Name* and a *Redirect URI*. 
 
9. For *Application Name* use **"alexa"**. This can be anything else as well. And for the *Redirect URI*, go back to Amazon Developer Console Account Linking page and at the bottom of the page you'll find some redirect URLs.
Copy **https://pitangui.amazon.com/api/skill/link/YOURVENDORID** or **https://layla.amazon.com/api/skill/link/YOURVENDORID** or **https://alexa.amazon.co.jp/api/skill/link/YOURVENDORID** and paste it in the *Redirect URI* field. They work according to the locale of your developer account, so try another if one of them doesn't work. Click on save changes.

10. You'll see it automatically generating *Client ID, Client Secret, Authorization URL, and Access Token URL*. Now copy these from the oauth app page and paste it in the *Client ID, Client Secret, Authorization URL, and Access Token URL* fields on the amazon developer console account linking page.

11. Choose **"HTTP Basic"** for *Client Authentication Scheme* and leave *Scope*, *Domain List* and *Default Access Token Expiration Time* empty. Click on Save on top.

12. We are done on setting our OAuth App which will give us the **access token** to use for logging in. But for that we need to also enable custom oauth login for our server which we will do in the next steps.

13. Go to your **Server -> Three Dot Menu -> Administration**. Scroll down on your left and select **OAuth** and on top right click on **Add custom OAuth**.

![Add custom OAuth](https://i.ibb.co/4jykrFx/diagram3.jpg)

14. Give a unique name in lower case for the custom oauth. For example enter **"alexaskill"**.Click on Send. Set this name in the lambda environment variables for **OAUTH_SERVICE_NAME**. 

15. You will now be provided a few fields some of which will be prefilled. We only need to change a few. First change the *Enable* to **true**. In the *URL* enter **https://yourservername.rocket.chat/api/v1**. 

16. Finally at the bottom switch *Merge users* to true. We don't need to make any other changes here.

17. Click on **Save Changes** on top. WE ARE DONE!
	
### Testing

1. Before testing, you must make sure that Account Linking has completed.   Go to alexa.amazon.com or your alexa app and click **account linking** to complete the link.

2. To test, you need to login to Alexa Developer Console, and enable the "Test" switch on your skill from the "Test" Tab.

3. Once the "Test" switch is enabled, your skill can be tested in the Alexa skill simulator or on devices associated with the developer account as well. Speak to Alexa from any enabled device, from your browser at [echosim.io](https://echosim.io/welcome), or through your Amazon Mobile App and say :

	```text
	Alexa, start rocket chat
	```
	
	
## Customization

1. ```./skill.json```

   Change the skill name, example phrase, icons, testing instructions etc ...

   See the Skill [Manifest Documentation](https://developer.amazon.com/docs/smapi/skill-manifest.html) for more information.

2. ```./lambda/custom/index.js```

   Add new handlers for intents, modify intent logic, enhance the functionality of the source code to customize the skill.

3. ```./lambda/custom/resources/*.json```

   Modify messages, and other strings to customize the skill responses. Repeat the operation for each locale you are planning to support.

4. ```./models/*.json```

	Change the model definition to replace the invocation name and, if necessary for your customization, the sample phrases for each intent.  Repeat the operation for each locale you are planning to support.


## Documentation To Refer

1. ```Rocket.Chat API Documentation```
        
    The REST API allows you to control and extend Rocket.Chat with ease - [REST API Documentation]( https://rocket.chat/docs/developer-guides/rest-api/ )

2. ```Axios Documentation```

    Promise based HTTP client for the browser and node.js - [Github Page](https://github.com/axios/axios )

3. ```Jargon Documentation```

    The Jargon SDK makes it easy for skill developers to manage their runtime content, and to support multiple languages from within their skill - [Github Page](https://github.com/JargonInc/jargon-sdk-nodejs/tree/master/packages/alexa-skill-sdk )
    
4. ```Slot Type Reference```

    The Alexa Skills Kit supports several slot types that define how data in the slot is recognized and handled - [Official Documentation ](https://developer.amazon.com/docs/custom-skills/slot-type-reference.html )
    
## Intent Structure

1. Keep sample utterance minimal.
2. Make sure you have included the values that are required to send to the API as slots in the sample utterance.
3. Use only custom slots and include real examples from Rocket.chat for Natural language training.
4. Include as many slot values as you can. More the merrier.

## A Little Help

Keep an eye on our issues. We are just beginning and will surely appreciate all the help we can get. All ideas are welcome.
Feel free to join the discussion in our Alexa channel - [Rocket.Chat Alexa Channel](https://open.rocket.chat/channel/alexa)
