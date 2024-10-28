
# Securing Media Files in AWS S3

## Step 1: Enable Server-Side Encryption (SSE)

To protect media files at rest, enable **Server-Side Encryption (SSE)** on the S3 bucket.

1. Go to the S3 console, open the **Properties** tab for the bucket.
2. Under **Default encryption**, select **Enable**.
3. Choose **SSE-S3** (Amazon S3-managed keys) or **SSE-KMS** (AWS Key Management Service-managed keys).

    - **SSE-S3** is simpler and managed directly by S3.
    - **SSE-KMS** offers additional control by integrating with AWS Key Management Service (KMS), which allows tracking and managing encryption keys.

This encryption ensures that all objects stored in the bucket are encrypted automatically.

---

## Step 2: Use Signed URLs for Access Control

Using **Signed URLs** allows you to create time-limited access URLs for users. This ensures that only authorized users can access files for a specific time.

- In your application, generate signed URLs using the AWS SDK. The URL expires after a predefined time, securing access.

- **Example Code** (in .NET Core C#):

    ```csharp
    using Amazon.S3;
    using Amazon.S3.Model;
    
    public class S3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName = "audio-files-store-{UNIQUE_ID}";

        public S3Service(IAmazonS3 s3Client)
        {
            _s3Client = s3Client;
        }

        public string GetPreSignedUrl(string objectKey, double expirationInMinutes)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = objectKey,
                Expires = DateTime.UtcNow.AddMinutes(expirationInMinutes)
            };
            return _s3Client.GetPreSignedURL(request);
        }
    }
    ```

Replace `{UNIQUE_ID}` with your actual bucket name.

---

## Step 3: Set Bucket Policy for HTTPS-Only Access

To secure data in transit, configure the bucket to deny any requests not made over HTTPS. This ensures that data is encrypted in transit.

- **Bucket Policy for HTTPS-Only Access**:

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Deny",
          "Principal": "*",
          "Action": "s3:*",
          "Resource": [
            "arn:aws:s3:::audio-files-store-{UNIQUE_ID}/*"
          ],
          "Condition": {
            "Bool": {
              "aws:SecureTransport": "false"
            }
          }
        }
      ]
    }
    ```

Replace `{UNIQUE_ID}` with your actual bucket name.

---

## Step 4: Configure an IAM Policy for Restricted Application Access

Create an IAM policy that limits access to specific actions and resources. This policy will only allow the application to perform the necessary actions on the S3 bucket.

1. Go to the **IAM Console** and select **Policies**.
2. Create a new policy with the following JSON configuration:

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:PutObject",
            "s3:GetObject",
            "s3:ListBucket"
          ],
          "Resource": [
            "arn:aws:s3:::audio-files-store-{UNIQUE_ID}",
            "arn:aws:s3:::audio-files-store-{UNIQUE_ID}/*"
          ]
        }
      ]
    }
    ```

3. Attach this policy to the application’s IAM role.

---

## Step 5: Enable Access Logging and Monitoring

To monitor access and troubleshoot unauthorized access attempts, enable **S3 Access Logging** and **AWS CloudTrail** for the S3 bucket.

- **Enable Access Logging**:
  1. In the **Properties** tab for the S3 bucket, go to **Server access logging**.
  2. Enable logging and specify a destination bucket to receive the logs.

- **Enable CloudTrail**:
  - CloudTrail logs all API requests made to your S3 bucket, providing a complete history of access requests for auditing purposes.

---

## Step 6: Use API Gateway and Lambda for Public Access (Optional)

For a secure API-driven approach, use **API Gateway** and **Lambda** as intermediaries between users and the S3 bucket. This setup restricts direct access to S3 and lets you enforce authentication and authorization policies.

1. Set up an **API Gateway** to handle incoming requests.
2. Configure a **Lambda function** to generate signed URLs or interact with S3 as needed.
3. Require **JWT tokens** or other authentication methods for access.

---

Thanks