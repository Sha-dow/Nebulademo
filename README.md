# Nebulademo
NebulaJS and EnigmaJS demo.

## Setup
1. Clone this repository to your local computer
2. Import Sales Example.qvf to you Qlik Cloud -tenant. 
- In this example we are using that as our application and graph from second sheet as example object.
- Take a note of the app id and object id. These are needed in step 4.
3. Create new web integration in cloud management console 
4. Import Application Automation template found under /bins -folder (json-file)
- Setup connection to Teams
- Copy Webhook URL. It will be needed in step 4.
4. Create a file for your env variables under /src-folder and name it env.js

- It should contain the following code:

```javascript
module.exports = {
    url: "<CLOUD TENANT URL>",
    webIntegrationId: "<WEB INTEGRATION ID>",
    appId: "<APP ID>",
    objectId: "<CHART ID FOR MAIN HYPERCUBE>",
    automationId: "<AUTOMATION WEBHOOK URL>"
  }
  ```
  
  5. Run npm install and npm start to start your node project