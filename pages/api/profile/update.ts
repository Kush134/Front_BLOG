import cookieWrapper from "@/pages/api/utils";
import {NextApiRequest, NextApiResponse} from "next";
import {uploadProfileImage} from "@/utils/s3ImageUploader";
import {UpdateProfileDTO} from "@/api/dto/profile.dto";

export default async function update(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const updateReq = req.body as UpdateProfileDTO;
    if (updateReq.newBase64Image) {
        updateReq.logoId = await uploadProfileImage(updateReq.newBase64Image);
        updateReq.newBase64Image = undefined;
    }

    await cookieWrapper(req, res, {
        method: 'post',
        url: '/profile/update',
        data: updateReq,
    });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb'
        }
    }
}