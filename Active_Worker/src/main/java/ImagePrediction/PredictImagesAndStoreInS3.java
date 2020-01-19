package ImagePrediction;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.Message;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

public class PredictImagesAndStoreInS3 {
    private static final String REQUEST_QUEUE_URL = "https://sqs.us-west-1.amazonaws.com/516204045453/requestQueue";
    private static final String RESPONSE_QUEUE_URL = "https://sqs.us-west-1.amazonaws.com/516204045453/responseQueue";
    private static final String BUCKET_NAME = "imagekeypair";

    public static String receiveMsg() {
        final AmazonSQS sqs_queue = AmazonSQSClientBuilder.defaultClient();

        List<Message> messages = sqs_queue.receiveMessage(REQUEST_QUEUE_URL).getMessages();
        if (messages.isEmpty()) {
            //terminateInstance();
            return "-1";
        } else {
            return messages.get(0).getBody();
        }
    }

    public static void insertInS3(String bucketName, String key, String value) {
        final AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
        try {
            s3.putObject(bucketName, key, value);
        } catch (AmazonServiceException e) {
            System.err.println(e.getErrorMessage());
        }

    }

    private static String executeCommand(String command) {

        StringBuffer recognisedImage = new StringBuffer();

        Process imageRecognitionReq;
        try {
            imageRecognitionReq = Runtime.getRuntime().exec(command);
            imageRecognitionReq.waitFor();
            BufferedReader terminalReader = new BufferedReader(new InputStreamReader(imageRecognitionReq.getInputStream()));

            String eachLine = "";
            while ((eachLine = terminalReader.readLine()) != null) {
                recognisedImage.append(eachLine + "\n");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "-1";
        }
        return recognisedImage.toString();
    }


    private static String getImageNameFromURL(String inputURL) {
        String[] allPartsOfURL = inputURL.split("/");
        return allPartsOfURL[allPartsOfURL.length - 1];
    }

    private static String getResultValue(String resultFromCommandLines) {
        String resultWithScores[] = resultFromCommandLines.split("\\(");
        String resultNames = resultWithScores[0];
        return resultNames.trim();
    }

    private static String createJSONString(String uuid, String value) {
        JSONObject retJSONObj = new JSONObject();
        retJSONObj.put("requestUUID", uuid);
        retJSONObj.put("result", value);
        return retJSONObj.toString();
    }


    class Multithreads extends Thread {
        private String urlToProcess;
        private String uuid;
        private S3JavaUtility s3Util = new S3JavaUtility();
        private String jsonResult;

        public Multithreads(String message, String uuid) {
            this.urlToProcess = message;
            this.uuid = uuid;
        }

        public void run() {
            String imageRecogCommand = "python /home/ubuntu/tensorflow/models/tutorials/image/" +
                    "imagenet/classify_image.py --image_file " +
                    "" + urlToProcess + " --num_top_predictions 1";
            String results = executeCommand(imageRecogCommand);
            //System.out.println(urlToProcess + " " + results + " Command:" + imageRecogCommand);
            //System.out.println(urlToProcess + " " + results);
            String finalResult = getResultValue(results);
            String key = getImageNameFromURL(urlToProcess);
            s3Util.putObject(BUCKET_NAME, key, finalResult);
            jsonResult = createJSONString(uuid, finalResult);
        }

        public String getJsonResult() {
            return this.jsonResult;
        }
    }

    public void runUtility() {

        SQSJavaUtility sqsUtil = new SQSJavaUtility();
        int counter = 0;
        while (true) {
            try {
                int i = sqsUtil.getMessageCount(REQUEST_QUEUE_URL);
                if (i == 0) {
                    //System.out.println("No messages in the system");
                    Thread.sleep(500);
                } else {
                    List<Message> messages = sqsUtil.receiveMsg(REQUEST_QUEUE_URL);
                    if (messages.size() == 0)
                        Thread.sleep(500);
                    else {
                        Multithreads[] multithreads = new Multithreads[Math.min(messages.size(), 4)];
                        JSONParser jsonParser = new JSONParser();
                        for (int iter = 0; iter < multithreads.length; iter++) {
                            JSONObject jsonObject = (JSONObject) jsonParser.parse(messages.get(iter).getBody());
                            String imageURL = jsonObject.get("ImageURL").toString();
                            String uuid = jsonObject.get("uuid").toString();
                            multithreads[iter] = new Multithreads(imageURL, uuid);
                            multithreads[iter].start();
                        }
                        for (int iter = 0; iter < multithreads.length; iter++) {
                            multithreads[iter].join();

                            sqsUtil.sendMsg(multithreads[iter].getJsonResult(), RESPONSE_QUEUE_URL);
                            sqsUtil.deleteMessage(messages.get(iter), REQUEST_QUEUE_URL);
                        }
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.out.println("Exception occured:" + e.getMessage());
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        PredictImagesAndStoreInS3 predictImagesAndStoreInS3 = new PredictImagesAndStoreInS3();
        predictImagesAndStoreInS3.runUtility();
    }
}
