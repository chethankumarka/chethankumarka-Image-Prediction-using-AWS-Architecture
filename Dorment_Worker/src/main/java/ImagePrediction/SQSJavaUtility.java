package ImagePrediction;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.*;

import java.util.List;
import java.util.Map;

/**
 * Created by gurumurthy on 3/1/18.
 */
public class SQSJavaUtility {

    public void createQueue(String queueName) {
        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
        CreateQueueResult create_result = sqs.createQueue(queueName);
    }

    public int getMessageCount(String queueUrl) {
        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
        GetQueueAttributesRequest request = new GetQueueAttributesRequest();
        request = request.withAttributeNames("ApproximateNumberOfMessages");
        request = request.withQueueUrl(queueUrl);
        Map<String, String> attrs = sqs.getQueueAttributes(request).getAttributes();
        int messages = Integer.parseInt(attrs.get("ApproximateNumberOfMessages"));
        return messages;
    }

    public void sendMsg(String messageBody, String queueURL) {
        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
        SendMessageRequest send_msg_request = new SendMessageRequest()
                .withQueueUrl(queueURL)
                .withMessageBody(messageBody);
        sqs.sendMessage(send_msg_request);
    }

    public List<Message> receiveMsg(String queueURL) {
        final AmazonSQS sqs_queue = AmazonSQSClientBuilder.defaultClient();
        ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest();
        receiveMessageRequest.withMaxNumberOfMessages(1);
        receiveMessageRequest.withQueueUrl(queueURL);
        List<Message> strings = sqs_queue.receiveMessage(receiveMessageRequest).getMessages();
        return strings;
    }

    public void deleteMessage(Message queueMsg, String queueURL) {
        final AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();
        sqs.deleteMessage(queueURL, queueMsg.getReceiptHandle());
    }

}
