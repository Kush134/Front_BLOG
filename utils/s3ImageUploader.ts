import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {profileBucket, subscriptionBucket} from "@/utils/s3";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

/**
 * Get credentials from env
 */
const s3 = new S3Client({})

export async function uploadProfileImage(base64Image: string): Promise<string | undefined> {
    return await uploadToS3(profileBucket, base64Image);
}

export async function uploadSubscriptionImage(base64Image: string): Promise<string | undefined> {
    return await uploadToS3(subscriptionBucket, base64Image);
}

async function uploadToS3(bucket: string, base64Image: string): Promise<string | undefined> {
    console.log(`Start saving new image`);

    const type: string = base64Image.substring("data:image/".length, base64Image.indexOf(";base64"));

    const key = uuidv4();
    const input: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: base64StringToBuffer(base64Image),
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    };
    await s3.send(new PutObjectCommand(input))

    console.log(`New image saved ${input.Key}`);
    return input.Key;
}

function base64StringToBuffer(base64String: string): Buffer {
    return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
}