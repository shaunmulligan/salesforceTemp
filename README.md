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

###Connect up the hardware
#### Wiring

**Warning: disconnect the raspberry pi for power before wiring up these parts**

1. Connect up the DS18b20 as shown in the diagram, with pin1 connected to ground (GND), pin2 connected to GPIO4 of the raspberry pi and pin3 connected to 3.3V. 
1. Additionally you will need to connect a resistor between pin2 (the data line) and the 3.3V supply voltage. This resistor can be any value between 4.7KΩ and 10KΩ.
1. Connect the ethernet cable to the raspberry pi and power it up using the micro usb.
Here is a diagram of the circuit:

![Circuit diagram](/docs/images/diagram.png)

###Clone & push
clone repo, add resin remote, git push resin master 