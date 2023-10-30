import {GetServerSidePropsContext} from "next";

export const getAuthCookie = (ctx: GetServerSidePropsContext) => {
    return ctx.req.headers.cookie;
};