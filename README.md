# Salesforce temperature probe
In this example, we will use resin.io to deploy a node.js app that reads a digital temperature sensor on the Raspberry Pi, when the temperature exceeds a user defined thershold temperature, the app creates a case on Salesforce and we will be able to view it in the cases stream.

## Things you will need:

The recipe for this project is as follows:

* Raspberry Pi with ethernet cable for internet connectivity 
* A USB -> micro USB cable for power.
* One or more [DS18b20][6] digital temperature sensors.
* A 4.7KΩ or 10KΩ.
* A breadboard, for prototyping.
* Jumper wires to connect everything.

###Setup a resin.io account
1. Go to [resin.io/signup](https://alpha.resin.io/signup) and sign up for a resin.io account.
1. Setup your public ssh key on git, if you are part of the Dreamforce workshop, we have already created a ssh key for you on you laptop, so navigate to `C:/Users/admin/.ssh` and open `id_rsa.pub` with a text editor. Copy the contents and paste it into the box provided on resin.io
2. Resin.io will now ask you to create a new application. Go ahead and do that. Application names can only contain letters [A-z] and numbers [0-9].
3. Once your app is created, download the zip. Do not worry about the network connection settings.
4. Extract zip and copy the contents of the file over to your SD card.
5. Eject the SD card from your PC and put in the Raspberry pi, make sure the Raspberry pi is connected to the network ethernet cable. We are now ready to power it up.
6. It should now take about 6 minutes to appear on your resin.io dashboard. The pi is using this time to expand its file system and partition the SD card, as well as connect with our resin.io servers.

while we wait...

###Setup Saleforce credentials
For this example, you will need a developer account on salesforce. If you don't already have one, head over here https://developer.salesforce.com/ and get one.
In order to authenticate requests from outside of the Salesforce organisation IP range, we will need to get our security token.
1. Getting SF security token
 + Go to your name and click
 + Select My Settings
 + Select Personal
 + Sixth option is "Reset My Security Token"
... you should then get an email with your security token, note it down somewhere because we will use it soon.

2. Now in your newly created app on the resin.io dashboard, click on the small yellow gear at the bottom. Here we can create enviroment variables to use in our code running on the raspberry pi. For this app we will need to create one for `SF_USERNAME`, `SF_PASSWORD` and `SF_SEC_TOKEN`. Optionally you can include sample interval and threshold.

Hopefully by now your raspberry pi has shown up on the dash board. You should now be able to click on the "identify device" button and see the little green LED flash. We are now ready to start pushing code...but lets first setup some electronics.

![Circuit diagram](/docs/images/env_vars.png)

###Connect up the hardware
#### Wiring

**Warning: disconnect the raspberry pi for power before wiring up these parts**

1. Connect up the DS18b20 temperature senosr as shown in the diagram, with pin1 (black wire) connected to ground (GND), pin2 (blue wire) connected to GPIO4 of the raspberry pi and pin3 (red wire) connected to 3.3V. 
1. Additionally you will need to connect a resistor between pin2 (the data line) and the 3.3V supply voltage. This resistor can be any value between 4.7KΩ and 10KΩ.
1. Connect the ethernet cable to the raspberry pi and power it up using the micro usb.
Here is a diagram of the circuit:

![Circuit diagram](/docs/images/diagram.png)


###Clone & push
In your terminal, clone this repo locally, add resin remote by copying it from the dashboard on the top right, now on your PC terminal do `git push resin master`.
You should see a bunch of logs scroll on your terminal as your code is cross-compiled in the cloud, this should take about 60 seconds and you will see a friendly unicorn on your terminal, like this...

![unicorn](/docs/images/unicorn.png)


###Salesforce case logging setup
4. Create a PushTopic for Case updates

 - Select Your Name | Developer Console.
 - Click Debug | Open Execute Anonymous Window.
 - In the Enter Apex Code window, paste in the following Apex code, and click Execute.

```
PushTopic pushTopic = new PushTopic();
pushTopic.Name = 'CaseUpdates';
pushTopic.Query = 'SELECT Id, Subject, Description FROM Case';
pushTopic.ApiVersion = 31.0;
pushTopic.NotifyForOperationCreate = true;
pushTopic.NotifyForOperationUpdate = true;
pushTopic.NotifyForOperationUndelete = true;
pushTopic.NotifyForOperationDelete = true;
pushTopic.NotifyForFields = 'Referenced';
insert pushTopic;
```

5. Upload streaming.zip (attached) as a Static Resource
 - Setup | Develop | Static Resources
   - Click 'New' (not 'Create New View!')
   - Name: streaming
   - select streaming.zip (attached)
   - change 'Cache Control' to public
   - Hit 'Save'
   - [streaming.zip](https://dl.dropboxusercontent.com/u/9795699/streaming.zip "streaming.zip") 

6. Create CaseController and CasePage to show most recent cases
 - Setup | Develop | Apex Classes
 - Hit 'New'
 - Paste in the following code:

```
public class CaseController {
    public List<Case> cases {
        get {
            // Re-run the query every time the page references cases
            // normally we'd do this in the constructor and cache the
            // result in the controller, but we want it to be more
            // dynamic
            return [SELECT Subject, Description 
                    FROM Case
                    ORDER BY CreatedDate DESC
                    LIMIT 20];
        } 
        set;
    }
    
    public CaseController() {
    }
}
```

 - Setup | Develop | Pages
 - Hit 'New'
 - Label: CasePage
 - Replace the existing markup with the following:

```
<apex:page controller="CaseController" sidebar="false">
    <apex:includeScript value="{!URLFOR($Resource.streaming, 'cometd.js')}"/>
    <apex:includeScript value="{!URLFOR($Resource.streaming, 'jquery-1.5.1.js')}"/>
    <apex:includeScript value="{!URLFOR($Resource.streaming, 'jquery.cometd.js')}"/>
    <script type="text/javascript">
    (function($){
        $(document).ready(function() {
            // Connect to the CometD endpoint
            $.cometd.init({
               url: window.location.protocol+'//'+window.location.hostname+'/cometd/27.0/',
               requestHeaders: { Authorization: 'OAuth {!$Api.Session_ID}'}
           });

           // Subscribe to a topic. JSON-encoded update will be returned
           // in the callback
           $.cometd.subscribe('/topic/CaseUpdates', function(message) {
               // We don't really care about the update detail - just
               // rerender the list of Cases
               rerenderPageBlock();
           });
        });
    })(jQuery)
    </script>
    <apex:form>
        <apex:actionFunction name="rerenderPageBlock" rerender="pageBlock" />
        <apex:pageBlock id="pageBlock">
            <apex:pageBlockSection title="Case">
                <apex:pageBlockTable value="{!cases}" var="case">
                    <apex:column value="{!case.subject}"/>
                    <apex:column value="{!case.description}"/>
                </apex:pageBlockTable>
            </apex:pageBlockSection>
        </apex:pageBlock>
    </apex:form>
</apex:page>
```

In the browser, go to https://instance.salesforce.com/apex/CasePage, where instance is whatever prefix is in the URL, e.g. na17. You should see a list of the most recent 20 Cases - fire the web service call again and the page should automatically update.
