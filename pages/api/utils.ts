import {NextApiRequest, NextApiResponse} from "next";
import {AxiosHeaders, AxiosRequestConfig} from "axios";
import {externalClient} from "@/core/axios";

export default async function cookieWrapper(
    req: NextApiRequest,
    res: NextApiResponse,
    axiosConfig: AxiosRequestConfig,
    deleteSessionCookie: boolean = false,
): Promise<string> {
    const response = await externalClient({
        ...axiosConfig,
        headers: {
            ...axiosConfig.headers,
            'Content-Type': 'application/json',
            Cookie: req.headers.cookie
        }
    });

    let cookie: string[] = ((response.headers as AxiosHeaders).get('set-cookie') ?? []) as string[];
    if (deleteSessionCookie) {
        cookie.push(`${req.headers.cookie}; Path=/; Max-Age=0`);
    }

    res.status(200)
        .setHeader("Set-Cookie", cookie)
        .json(response.data);
    return response.data;
}