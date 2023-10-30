import {BriefSubscriptionInfo} from "@/api/dto/subscription.dto";

export interface BaseProfileDTO {
    id: string;
    title: string;
    description: string;
    logoId: string,
    socialMediaLinks: string[];
}

export interface ProfileDTO extends BaseProfileDTO {
    subscriptions: BriefSubscriptionInfo[],
}

export interface UpdateProfileDTO {
    id: string;
    title: string;
    description: string;
    logoId: string | undefined,
    newBase64Image: string | undefined,
    socialMediaLinks: string[];
}