import {externalClient, internalClient} from "@/core/axios";
import {TgChatDTO, TgChatStatusDTO, TgIntegrationDTO} from "@/api/dto/integration.dto";

export const bindTelegram = async (subscriptionId: `0x${string}`, code: string): Promise<TgIntegrationDTO> => {
    return (await internalClient({
        method: 'post',
        url: `/api/integration/telegram`,
        data: {
            code: code,
            subscriptionId: subscriptionId,
        },
    })).data as TgIntegrationDTO;
}

export const getChat = async (subscriptionId: `0x${string}`): Promise<TgChatDTO> => {
    return (await internalClient({
        method: 'post',
        url: `/api/integration/telegramChat`,
        data: {
            subscriptionId: subscriptionId,
        },
    })).data as TgChatDTO;
}

export const generateInviteCode = async (subscriptionId: `0x${string}`): Promise<TgChatStatusDTO> => {
    return (await internalClient({
        method: 'post',
        url: `/api/integration/generateInviteCode`,
        data: {
            subscriptionId: subscriptionId,
        },
    })).data as TgChatStatusDTO;
}


/**
 * Server side
 */
export const getInviteLinkStatus = async (subscriptionId: `0x${string}`, cookie: any): Promise<TgChatStatusDTO> => {
    return (await externalClient({
        method: 'post',
        url: '/telegram/get-invite-link-status',
        data: {
            subscriptionId: subscriptionId,
        },
        headers: {
            Cookie: cookie
        }
    })).data as TgChatStatusDTO;
}