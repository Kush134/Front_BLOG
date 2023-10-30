export interface UpdateSubscriptionDTO {
    id: `0x${string}`;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImageId: string | undefined;
    newMainBase64Image: string | undefined;
    previewImageId: string | undefined;
    newPreviewBase64Image: string | undefined;
    price: string;
    coin: string;
}

export interface SubscriptionIdDTO {
    subscriptionId: string;
}

export interface BriefSubscriptionInfo {
    id: string;
    status: SubscriptionStatus,
    ownerId: string;
    title: string;
    previewImageId: string,
}

export type SubscriptionStatus =
    'DRAFT' |
    'NOT_PAID' |
    'PAYMENT_PROCESSING' |
    'UNPUBLISHED' |
    'PUBLISHED'
    ;

export interface SubscriptionPaymentStatus {
    status: 'PAID' | 'NOT_PAID'
}