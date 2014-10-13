## Parts

The recipe for this project is as follows:

* Raspberry Pi with ethernet cable for internet connectivity and
  USB -> micro USB cable for power.
* one or more [DS18b20][6] digital temperature sensors.
* a 4.7KΩ or 10KΩ.
* A breadboard, for example the [AD-102 from Maplin][2].
* Jumper wires to connect everything. For example, these
  [male-to-female connectors from Maplin][3].

###Setup a resin.io account
1. setup ssh key on git,
open `id_rsa.pub` in the `C:\Users\username\.ssh` folder and copy the ssh key.
2. start a new app
3. download the zip.
4. extract zip and copy the contents of the file over to the SD card
5. eject the SD card, put in RPI, make sure the RPI is connected to the network and power it up.
6. it should take about 6 minutes to register the device and you should see it pop up in your resin.io dashboard.

###Connect up the hardware
#### Wiring

**Warning: disconnect the raspberry pi for power before wiring up these parts**

1. Connect up the DS18b20 as shown in the diagram, with pin1 connected to ground (GND), pin2 connected to GPIO4 of the raspberry pi and pin3 connected to 3.3V. 
1. Additionally you will need to connect a resistor between pin2 (the data line) and the 3.3V supply voltage. This resistor can be any value between 4.7KΩ and 10KΩ.
1. Connect the ethernet cable to the raspberry pi and power it up using the micro usb.
Here is a diagram of the circuit:

![Circuit diagram](/docs/images/diagram.png)

while we wait...

###Setup Saleforce credentials
1. get SF security token
 + Go to your name and click
 + Select My Settings
 + Select Personal
 + Sixth option is "Reset My Security Token"
... you should then get an email with your security token.

2. Now create the environment variables for you app in the resin.io dashboard. You will need one for `SF_USERNAME`, `SF_PASSWORD` and `SF_SEC_TOKEN`. Optionally you can include sample interval and threshold.

![Circuit diagram](/docs/images/env_vars.png)



###Clone & push
clone this repo locally, add resin remote by copying it from the dashboard on the top right, now on your PC terminal do `git push resin master` 


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
