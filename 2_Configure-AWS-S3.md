
# Configuring AWS S3 for Media File Storage


## Step 1: Create an S3 Bucket

1. Log in to the AWS Management Console and open the **S3** service.
2. Click on **Create bucket**.
3. Enter a unique name for the bucket, such as `audio-files-store-{UNIQUE_ID}`.
4. Select the appropriate AWS region for data storage.
5. Configure the **Bucket Settings**:
   - **Block Public Access**: Ensure that public access to the bucket is blocked for security reasons.
   - **Versioning**: Enable versioning to keep track of changes to files, which is useful for restoring previous versions if files are accidentally modified.

6. Click **Create bucket** to finalize.

---

## Step 2: Configure Bucket Policies

The bucket policy defines who has access to the contents and which actions are allowed. We need to set the bucket policy to allow only HTTPS access and restrict access to authenticated users.

### Bucket Policy for HTTPS-Only Access

Add this policy to the bucket to enforce HTTPS-only access:

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

Replace `{UNIQUE_ID}` with actual bucket identifier.

---

## Step 3: Create an IAM Policy for Application Access

Create a custom IAM policy that grants the application specific permissions to interact with the S3 bucket.

1. Go to **IAM** in the AWS Console.
2. Select **Policies** from the sidebar, then click **Create policy**.
3. In the JSON editor, paste the following policy:

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

4. Save the policy with a unique name, like `AudioAppS3AccessPolicy`.

---

## Step 4: Create an IAM Role for the Application

Assign the above policy to a role that the application will use to access the S3 bucket.

1. In **IAM**, navigate to **Roles** and click **Create role**.
2. Select **AWS service** and choose **EC2** or **Lambda**, depending on where your application is running.
3. Click **Next** and attach the `AudioAppS3AccessPolicy` policy created earlier.
4. Complete the role creation by giving it a unique name, like `AudioAppS3AccessRole`.

---

## Step 5: Enable Server-Side Encryption

To protect data at rest, enable **server-side encryption** on the S3 bucket.

1. Go to the **Properties** tab of the S3 bucket.
2. Scroll down to **Default encryption** and choose **Enable**.
3. Select **SSE-S3** (Amazon S3-managed keys) for encryption.

This setting will ensure that all objects uploaded to the bucket are encrypted by default.

---

## Step 6: Set Up Signed URLs for Secure Access

Use **signed URLs** to provide time-limited access to files in S3, ensuring that only authenticated users can download or stream files.

- **Generating Signed URLs**: In your application, use the AWS SDK to generate a signed URL, specifying an expiration time for limited access. 
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

Replace `{UNIQUE_ID}` with the actual bucket name.

---


With these configurations, the AWS S3 bucket is prepared for storing and securely managing media files for streaming applications.

Thanks.