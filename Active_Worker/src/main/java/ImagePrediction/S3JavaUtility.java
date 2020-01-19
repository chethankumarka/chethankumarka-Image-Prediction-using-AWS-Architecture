package ImagePrediction;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.S3Object;

import java.util.List;

/**
 * Created by gurumurthy on 3/1/18.
 */
public class S3JavaUtility {

    public Boolean containsObject(String key, String value) {
        final AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
        S3Object retObject = s3.getObject(key, value);
        if (retObject != null) {
            return true;
        }
        return false;
    }

    public void putObject(String bucket_name, String key_name, String value) {
        final AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
        s3.putObject(bucket_name, key_name, value);
    }
}