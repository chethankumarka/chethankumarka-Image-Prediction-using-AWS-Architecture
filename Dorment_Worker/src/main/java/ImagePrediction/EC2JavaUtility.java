package ImagePrediction;

import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.AmazonEC2ClientBuilder;
import com.amazonaws.services.ec2.model.TerminateInstancesRequest;

public class EC2JavaUtility {
    public void terminateInstance(String instanceId) {
        final AmazonEC2 ec2 = AmazonEC2ClientBuilder.defaultClient();
        TerminateInstancesRequest request = new TerminateInstancesRequest().withInstanceIds(instanceId);
        ec2.terminateInstances(request);
    }
}
