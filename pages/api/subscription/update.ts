import {NextApiRequest, NextApiResponse} from "next";
import cookieWrapper from "@/pages/api/utils";
import {uploadSubscriptionImage} from "@/utils/s3ImageUploader";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";

export default async function update(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const updateReq = req.body as UpdateSubscriptionDTO;
    if (updateReq.newMainBase64Image) {
        updateReq.mainImageId = await uploadSubscriptionImage(updateReq.newMainBase64Image);
        updateReq.newMainBase64Image = undefined;
    }

    if (updateReq.newPreviewBase64Image) {
        updateReq.previewImageId = await uploadSubscriptionImage(updateReq.newPreviewBase64Image);
        updateReq.newPreviewBase64Image = undefined;
    }

    await cookieWrapper(req, res, {
        method: 'post',
        url: `/subscription/update`,
        data: updateReq,
    });
};

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb'
        }
    }
}