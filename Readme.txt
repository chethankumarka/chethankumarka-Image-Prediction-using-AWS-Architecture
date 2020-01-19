Steps to get AWS Account Ready with one Web Tier and one App Tier using snapshots.
1. Download the zip. From terminal cd to the directory.
2. Now do chmod +x startup.sh
3. ./startup.sh
4. Step 3 will return the IP address of the web server.(Public IP: 18.144.40.99)
5. Use this IP address to hit the url: "IP_Address/cloudimagerecognition?input=ImageURL". (Please note the URL parameter is "cloudimagerecognition" and not "cloudimagerecognition.php")

The following 3 commands will get one instance of web tier and one of app tier running.

Steps to configure the code base provided in EC2 instances(manual without snapshots)

Steps to configure app tier
Step 0 cd into the Web_Tier directory.
Step 1 check the credentials in web tier
Step 2 check the bucket exists in the system
Step 3 check the instance id in EC2 config if that id exists or not
Step 4 Check request and response queue exits in the aws system
Step 5 check if node is installed
Step 6 install forever by using sudo npm install -g forever
Step 7 take a clone of the git repo and cd to Phase 1
Step 8 run npm install in that folder
Step 9 random test is to start node App/server.js. You can check your ec2public-ip/cloudimagerecognition?input=imageURL. You will get a response.
Step 10 shutdown the port 9000
Step 11 install pip (be a root user as we need to start the things as root)
Step 12 install aws cli in command line
Step 13 configure aws by aws configure command. Should have your keys ready. This is required. AWS does not connect if start is not there
Step 14 make a foldr /var/log/tempLogs/ and give it the full permission 777. You can see security also but not required in this phase
Step 15 Put nohup forever /home/ubuntu/CloudComputing/Phase1/App/server.js &> /var/log/tempLogs/dump.log& in your /etc/rc.local(ubuntu specfic) and you are good to go
Step 16 Restart your server

Problems faced 
1) Maybe you might get credentials issue

Steps to configure Active Worker Tier
Step 1: Start a new server with image Id ami-07303b67. This is a deep learning image available in AWS Community Images.
Step 2: Transfer the code submitted in zip file to this instance using SCP or git.
Step 3: Now for installing java execute the following commands:
	i)  sudo add-apt-repository ppa:webupd8team/java
    	ii) sudo apt-get update
	iii) sudo apt-get install oracle-java8-installer
Step 4: Install maven using command sudo-apt-get install maven.
Step 5: Now login as root user doing sudo su.
Step 6: Now cd into the directory which has the code from there cd to worker node(Active/Dormant) folder
Step 7: Now do a maven clean install on that folder.
Step 8: This will create a jar file in the target.
Step 9: open /etc/rc.local using vim or any other edit.
Step 10: Change first line of rc.local to #!bin/bash
Step 11: Add the following commands to rc.local 
 	i) source /home/ubuntu/tensorflow/bin/activate
	ii) nohup /home/ubuntu/CloudComputing/App_maven/target/cloudcomputing-1.0-SNAPSHOT-jar-with-dependencies& > /var/log/tempLogs/dump.log&
Step 12: Restart this system.

Steps to configure dormant worker:
Same as active worker, but change step 12 to take a snapshot of the system.
Put this instance AMI into the monitor.js file of the web tier.

Public IP of already configured web server:
Public IP: 18.144.40.99

S3 Bucket name: imagekeypair

Developers:
Chethan Kumar Kolar Ananda Kumar(1214234150)
Gurumurthy Raghuraman(1211150041)
Santoshkumar Amisagadda(1213177132)
Shashank Kapoor(1213181604)


