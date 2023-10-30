import {externalClient, internalClient} from "@/core/axios";
import {
    SubscriptionIdDTO,
    SubscriptionPaymentStatus,
    SubscriptionStatus,
    UpdateSubscriptionDTO
} from "@/api/dto/subscription.dto";
import {ResponseDto} from "@/api/dto/response.dto";

export const updateSubscription = async (data: UpdateSubscriptionDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/update`,
        data: data,
    });
}

export const processPayment = async (data: SubscriptionIdDTO): Promise<SubscriptionStatus> => {
    return (await internalClient({
        method: 'post',
        url: `/api/subscription/processPayment`,
        data: data,
    })).data.status;
}

export const publish = async (data: SubscriptionIdDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/publish`,
        data: data,
    });
}
export const unpublish = async (data: SubscriptionIdDTO): Promise<void> => {
    return internalClient({
        method: 'post',
        url: `/api/subscription/unpublish`,
        data: data,
    });
}

/**
 * Server side
 */
export const loadSubscription = async (id: string, cookie: any): Promise<UpdateSubscriptionDTO> => {
    const response: ResponseDto<UpdateSubscriptionDTO> = (await externalClient({
        method: 'post',
        url: '/subscription/',
        data: {
            subscriptionId: id
        },
        headers: {
            Cookie: cookie
        }
    })).data;
    return response.data;
}

export const paymentStatus = async (data: SubscriptionIdDTO, cookie: any): Promise<SubscriptionPaymentStatus> => {
    return (await externalClient({
        method: 'post',
        url: '/subscription/get-subscription-payment-status',
        data: data,
        headers: {
            Cookie: cookie
        }
    })).data;
}