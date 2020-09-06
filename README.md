

<p  align="center">

<img  src="https://user-images.githubusercontent.com/41849970/57236777-691ae200-7043-11e9-8d8e-67e05e60a8e4.png">

</p>

  

<h3  align="center">

Innovating Incredible New User Experiences In The Alexa Ecosystem

</h3>

  

---

# Quick Project Setup
  

Follow [this](https://drive.google.com/file/d/1C0b0y07Lay6tkH1LbBVmECiplB6dRoSl/view?usp=sharing) walkthrough video of the project setup. Or Steps listed below.

1. Download the contents of this repository.
2. Go to Alexa Developer Console: https://developer.amazon.com/alexa/console/ask
3. Create a new Alexa skill with the following settings
	+ Default Language: Any English locale
	+ Model: Custom
	+ Hosting Backend Method: Provision your own
	+ Template: Hello World Skill
4. In the project repository, navigate to `./models/en-<locale>.json` file, and copy the contents inside the model.
5. In Alexa Developer console under **Build** > **Custom** > **Interaction Model** > **JSON Editor**. Paste the copied contents.
6. Under **Build** > **Invocation**. Change the *Skill Invocation Name* to **YOURSERVERNAME rocket chat**.
7. **Save** and **Build** the model.
8. Follow the steps from 1 to 17 in [Deployment](#deployment), under Configuring Account Linking section.
9. Login into [AWS](https://aws.amazon.com) console and Navigate to [Lambda](https://aws.amazon.com/lambda/) functions console.
10. Create a lambda function and add policies to access DynamoDB and Cloudwatch to the role for this lambda function. (Refer walkthrough video)
11. Add the following environment variables:
```
SERVER_URL=https://yourservername.rocket.chat
OAUTH_SERVICE_NAME=(The name of the Custom OAuth setup in Rocket Chat server)
DDB_NAME=(Any name for the Dynamo DB table used by your skill. Eg: alexa)
```
12. Add a trigger with the following settings: **Add Trigger** > **Alexa Skills Kit** > **Skill ID verification**: Disable (Or Enable according to requirement)
13. In the project repository, navigate to `./lambda/custom` file, and follow the below steps:
    + Open terminal and run `npm install`
    + Select all the files and compress into a .zip file.
14. Upload this zip file in the AWS lambda function.
15. Copy the ARN of the lambda function.
16. Navigate to **Build** > **Endpoint** in the Alexa developer console and paste this endpoint in the **Default Region** field of **AWS Lambda ARN**.
17. To test the Skill, go to Test tab and type: Open YOURSERVERNAME rocket chat
18. If everything goes well, you'll be prompted to link your account. Open the Alexa App and Click on the Account Linking Card.

# Project Setup For Development

  

**Note:** The rest of this readme assumes you have your developer environment ready to go and that you have some familiarity with CLI (Command Line Interface) Tools, [AWS](https://aws.amazon.com/), and the [ASK Developer Portal](https://developer.amazon.com/alexa-skills-kit).

  

### Repository Contents

*  `/.ask` - [ASK CLI (Command Line Interface) Configuration](https://developer.amazon.com/docs/smapi/ask-cli-intro.html)

*  `/lambda/custom` - Back-End Logic for the Alexa Skill hosted on [AWS Lambda](https://aws.amazon.com/lambda/)

*  `/lambda/custom/resources` - Language specific speech response

*  `/models` - Voice User Interface and Language Specific Interaction Models

*  `skill.json` - [Skill Manifest](https://developer.amazon.com/docs/smapi/skill-manifest.html)

  
  

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

  

### Configuring Notifications

  

1. If you already have an Alexa Skill deployed, Open ```./skill.json``` file and add the ARN of your AWS Lambda function.

  

2. If you're about to deploy your Alexa Skill for the first time, cut the following piece of code from the ```./skill.json``` file,

```javascript

    "permissions": [
        {
            "name": "alexa::devices:all:notifications:write"
        }
    ],
    "events": {
        "publications": [
            {
                "eventName": "AMAZON.MessageAlert.Activated"
            }
        ],
        "endpoint": {
            "uri": "your-arn-here"
        },
        "subscriptions": [
            {
                "eventName": "SKILL_PROACTIVE_SUBSCRIPTION_CHANGED"
            }
        ],
        "regions": {
            "NA": {
                "endpoint": {
                    "uri": "your-arn-here"
                }
            }
        }
    }
	
```
  

3. Go to [Deployment](#deployment) and complete the deployment steps and also configure the account linking. Once done complete the following steps.
4. Paste the above piece of code back to your ```./skill.json``` file. Add the ARN of your AWS Lambda function you just deployed in place of ```your-arn-here```.
5. Deploy the changes.

  

```bash

	$ ask deploy

```

6. Go to your Alexa App and enable notifications for this skill. New users of the skill will be the shown the permissions settings while enabling the skill itself.

  

7. Setup a notifications microservice following the instructions in [Rocket Chat Alexa Skill Notifications](https://github.com/RocketChat/alexa-rocketchat-notification). Also it will be worth checking out this video to get insights [Alexa Notifications with Proactive Events - Dabble Lab #125](https://www.youtube.com/watch?v=oMcHTMZDTVQ).

  

8. WE ARE DONE! To test the skill, go to [Testing](#testing).

  

### Deployment

  

ASK CLI will create the skill and the lambda function for you. The Lambda function will be created in ```us-east-1 (Northern Virginia)``` by default.

  

1. Make sure you are at your `alexa-rocketchat` top level project directory, then deploy the skill and the lambda function in one step by running the following command:

  

```bash

    $ ask deploy

```

2. After Deploying go to lambda console and set Environment variables values.

e.g:

1.  **SERVER_URL** https://yourservername.rocket.chat

2.  **OAUTH_SERVICE_NAME** (The name of the Custom OAuth you setup in next step)

3.  **DDB_NAME** (The name of the Dynamo DB table being used by your skill)

  

4. Then go to the IAM console and add policies to access DynamoDB and Cloudwatch to the role for this lambda function.
5. Go back to [Configuring Notifications](#configuring-notifications) to complete the rest of notification setup or proceed with configuring account linking steps if you're already done.

### Configuring Account Linking

  

1. Login to Alexa Developer Console, click on the Rocket.Chat skill on the list, and go to Build section on top.

  

2. Click on Account Linking on the bottom left.

  

3. Toggle the *Do you allow users to create an account or link to an existing account with you?* button. Toggle *Allow users to enable skill without account linking* as False. Select auth code grant.

  

4. Now we need to fill up the *Authorization URI, Access Token URI, Client ID, Client Secret* which we will generate on our rocket chat server.

  

5.  **Note you need to be admin of the server to proceed with the further steps.**

  

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

  

17. Click on **Save Changes** on top. We are done with setting up the account linking.
18. Go back to Step 4 of [Configuring Notifications](#configuring-notifications) and complete the rest of notifications setup.

### Testing

  

1. Before testing, you must make sure that Account Linking has completed. Go to alexa.amazon.com or your alexa app and click **account linking** to complete the link.

  

2. To test, you need to login to Alexa Developer Console, and enable the "Test" switch on your skill from the "Test" Tab.

  

3. Once the "Test" switch is enabled, your skill can be tested in the Alexa skill simulator or on devices associated with the developer account as well. Speak to Alexa from any enabled device, from your browser at [echosim.io](https://echosim.io/welcome), or through your Amazon Mobile App and say :

  

```text

    Alexa, start rocket chat

```


### Setting up Local development

With this setup, develper can run the backend code of the skill in the system itself, leading to faster development.  
Note: The below setups are optional and is not required for the code to run in aws lambda.

1. Navigate to `./lambda/custom` folder and make a new file named .env

2. Add the following to .env file
```
ACCESS_KEY_ID=<your aws account access key ID>
SECRET_ACCESS_KEY=<your aws account secret access key>
SERVER_URL=<rocket chat server url>
OAUTH_SERVICE_NAME=<oauth service name>
DDB_NAME=<dynamo table name>
CUSTOM_LOG_URL=<custom logger url(optional parameter, can be ignored if logs are not required)>
```
*Note*: The logs generated during the skill execution is sent to the CUSTOM_LOG_URL as a POST request. The body of this POST request then needs to be displayed in an external website. This is a potential risk to privacy and should only be used during development. [Here](https://github.com/AdarshNaidu/My-Logs) is the code to setup a server that displays the logs.

3. From `./lambda/custom` folder, run `npm start` to start the server at port 3000.

4. Install `ngrok`, then in a new terminal run `ngrok http 3000`, copy the https forwarding link.

5. In the build section of the Alexa Developer Console, go to endpoint submenu in the sidebar and set the Service Endpoint Type to HTTPS.

6. In the default region input box, paste the link from step 4 and set the drop down to "My development endpoint is a sub-domain of a domain that has wildcard certificate from a certificate authority" option, save the changes.

## Customization

  

1.  ```./skill.json```

  

Change the skill name, example phrase, icons, testing instructions etc ...

  

See the Skill [Manifest Documentation](https://developer.amazon.com/docs/smapi/skill-manifest.html) for more information.

  
2. ```./lambda/custom/handlers```


Add new handlers for intents in specific folders, modify intent logic, enhance the functionality of the source code to customize the skill.  
The naming convention and folder structure is as follows
```
Intent name: FunctionIntent
Intent type: channel based intent
Intent path: ./lambda/custom/handlers/Channels/FunctionIntentHandler(s).js
```


3.  ```./lambda/custom/resources/*.json```

  

Modify messages, and other strings to customize the skill responses. Repeat the operation for each locale you are planning to support.

  

4.  ```./models/*.json```

  

Change the model definition to replace the invocation name and, if necessary for your customization, the sample phrases for each intent. Repeat the operation for each locale you are planning to support.

  
  

## Documentation To Refer

  

1.  ```Rocket.Chat API Documentation```

The REST API allows you to control and extend Rocket.Chat with ease - [REST API Documentation]( https://rocket.chat/docs/developer-guides/rest-api/ )

  

2.  ```Axios Documentation```

  

Promise based HTTP client for the browser and node.js - [Github Page](https://github.com/axios/axios )

  

3.  ```Jargon Documentation```

  

The Jargon SDK makes it easy for skill developers to manage their runtime content, and to support multiple languages from within their skill - [Github Page](https://github.com/JargonInc/jargon-sdk-nodejs/tree/master/packages/alexa-skill-sdk )

4.  ```Slot Type Reference```

  

The Alexa Skills Kit supports several slot types that define how data in the slot is recognized and handled - [Official Documentation ](https://developer.amazon.com/docs/custom-skills/slot-type-reference.html )

## Intent Structure

  

1. Keep sample utterance minimal.

2. Make sure you have included the values that are required to send to the API as slots in the sample utterance.

3. Use only custom slots and include real examples from Rocket.chat for Natural language training.

4. Include as many slot values as you can. More the merrier.

  

## A Little Help

  

Keep an eye on our issues. We are just beginning and will surely appreciate all the help we can get. All ideas are welcome.

Feel free to join the discussion in our Alexa channel - [Rocket.Chat Alexa Channel](https://open.rocket.chat/channel/alexa)