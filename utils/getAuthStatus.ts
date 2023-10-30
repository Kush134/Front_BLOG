import {GetServerSidePropsContext} from "next";
import {getAuthCookie} from "@/utils/cookie";
import {AuthenticationStatus} from "@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AuthenticationContext";

export const getAuthStatus = (ctx: GetServerSidePropsContext): AuthenticationStatus => {
    return getAuthCookie(ctx) !== undefined ? 'authenticated' : 'unauthenticated';
};

export const isAuth = (status: AuthenticationStatus): boolean => {
    return status === 'authenticated';
}