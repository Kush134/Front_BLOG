export const profileBucket = 'community-profile-images-1r34goy';
export const subscriptionBucket = 'community-subscription-images-321t9587g';

export function buildProfileHost(): string {
    return `${profileBucket}.s3.amazonaws.com`;
}

export function tryBuildProfileImageLink(id: string | undefined): string | undefined {
    return id ? buildProfileImageLink(id) : undefined;
}

export function buildProfileImageLink(id: String): string {
    return `https://${buildProfileHost()}/${id}`;
}

export function buildSubscriptionHost(): string {
    return `${subscriptionBucket}.s3.amazonaws.com`;
}

export function tryBuildSubscriptionImageLink(id: string | undefined): string | undefined {
    return id ? buildSubscriptionImageLink(id) : undefined;
}

export function buildSubscriptionImageLink(id: String): string {
    return `https://${buildSubscriptionHost()}/${id}`;
}