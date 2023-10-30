import React, {useEffect} from "react";
import homeStyles from "@/styles/Home.module.css";
import Header from "@/components/header/Header";
import SubscriptionEdit from "@/components/subscription/edit/SubscriptionEdit";
import Footer from "@/components/footer/Footer";
import {GetServerSidePropsContext, NextPage} from "next";
import {BriefProfile} from "@/components/subscription/Subscription";
import * as Api from "@/api";
import {ProfileDTO} from "@/api/dto/profile.dto";
import {getAuthCookie} from "@/utils/cookie";
import {getAuthStatus, isAuth} from "@/utils/getAuthStatus";
import {AuthProps} from "@/pages/_app";
import {useAccount} from "wagmi";
import {useRouter} from "next/router";
import * as Contract from "@/contract";
import {message} from "antd";

interface Props extends AuthProps {
    profileOwnerAddress: string,
    profile: BriefProfile
}

const CreatePage: NextPage<Props> = ({profileOwnerAddress, profile}) => {
    const {address} = useAccount();
    const router = useRouter();

    useEffect(() => {
        if (address && profileOwnerAddress !== address) {
            message.error('Wrong url!');
            router.push('/');
        }
    }, [address, profileOwnerAddress, router]);

    return (
        <main className={homeStyles.main}>
            <Header
                profileId={profile.id}
                base64Logo={profile.logoId}
            />
            <SubscriptionEdit data={undefined} profile={profile}/>
            <Footer/>
        </main>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    try {
        console.log('getServerSideProps');
        const profileId = ctx.query!!.profileId as string;
        const authStatus = getAuthStatus(ctx);
        if (!isAuth(authStatus)) {
            return {
                redirect: {
                    destination: `/`,
                    permanent: false,
                },
            }
        }

        let profile: BriefProfile | undefined;
        const profilePromise = Api.profile.loadProfile(profileId, getAuthCookie(ctx))
            .then(res => {
                const data = res as ProfileDTO
                if (!data) {
                    console.error(`Can't find profile by id ${profileId}`);
                    return;
                }
                profile = {
                    id: data.id,
                    title: data.title,
                    logoId: data.logoId,
                } as BriefProfile
            }).catch(e => console.error(`Catch error during loading profile by id ${profileId}`));

        let ownerAddress;
        const ownerPromise = Contract.profile
            .loadProfileOwner(profileId)
            .then((address) => (ownerAddress = address))
            .catch(e => {
                console.error(`Can't find owner by profile id ${profileId}`);
            });

        await Promise.all([profilePromise, ownerPromise]);

        if (!profile) {
            return {
                redirect: {
                    destination: `/`,
                    permanent: false,
                },
            }
        }

        return {
            props: {
                authStatus: authStatus,
                profileOwnerAddress: ownerAddress,
                profile: profile,
            }
        };
    } catch (err) {
        console.log(err?.toString());
        return {
            redirect: {
                destination: `/`,
                permanent: false,
            },
        }
    }
};

export default CreatePage;