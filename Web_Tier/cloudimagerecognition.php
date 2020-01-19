<!DOCTYPE html>
<html>
<body>

<?php

function addAWSCredentialsAsEnvVars() {
	//adding AWS credentials to enable shell_exec commands
	putenv('AWS_DEFAULT_REGION=us-east-2');
	putenv('AWS_ACCESS_KEY_ID=AKIAJNOSBDWNBGG5GCDQ');
	putenv('AWS_SECRET_ACCESS_KEY=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');
}

function getImageURL() {
	//getting image URL
	$imageURL = $_GET["input"];
	return $imageURL;
}

function getQueueURL() {
	//getting queueURL
	$queueURLInJSON = shell_exec('aws sqs get-queue-url --queue-name sqs_simplequeue');
	$queueURL = json_decode($queueURLInJSON,true);
	echo "<h3>" . $queueURL['QueueUrl'] . "</h3>";
	return $queueURL['QueueUrl'];
}

function sendMessage($queueURL, $messageBody) {
	$sendMessageCliCommand = 'aws sqs send-message --queue-url ' . $queueURL . ' --message-body ' . $messageBody;
	shell_exec($sendMessageCliCommand);
	echo "<p>Inserted in SQS</p>";	
}

addAWSCredentialsAsEnvVars();
$imageURL = getImageURL();
$sqsQueueURL = getQueueURL();
sendMessage($sqsQueueURL, $imageURL);
?>

</body>
</html>

