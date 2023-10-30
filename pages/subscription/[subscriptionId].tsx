import {useRouter} from 'next/router'
import homeStyles from "@/styles/Home.module.css";
import styles from '@/styles/Subscription.module.css'
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {GetServerSidePropsContext, NextPage} from "next";

import * as Api from "@/api";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Subscription, {BriefProfile} from "@/components/subscription/Subscription";
import SubscriptionEdit from "@/components/subscription/edit/SubscriptionEdit";
import Footer from "@/components/footer/Footer";
import {AuthProps} from "@/pages/_app";
import {getAuthStatus} from "@/utils/getAuthStatus";
import * as Contract from "@/contract";
import {ProfileDTO} from "@/api/dto/profile.dto";
import {TgChatStatusDTO} from "@/api/dto/integration.dto";
import {useAccount} from "wagmi";

interface Props extends AuthProps {
    subscription: UpdateSubscriptionDTO;
    profileOwnerAddress: string,
    profile: BriefProfile,
    paymentStatus: 'PAID' | 'NOT_PAID',
    tgLinkStatus?: TgChatStatusDTO
}

const SubscriptionPage: NextPage<Props> = (
    {
        subscription,
        profileOwnerAddress,
        profile,
        paymentStatus,
        tgLinkStatus
    }
) => {
    const {address} = useAccount();
    const router = useRouter();
    const {editing} = router.query;

    const isOwner = () => address && address === profileOwnerAddress;

    const [profileIdByOwner, setProfileIdByOwner] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (address) {
            Contract.profile
                .getProfileIdByOwnerAndIndex(address, 0)
                .then((profileIdByOwner) => setProfileIdByOwner(profileIdByOwner))
                .catch(() => setProfileIdByOwner(undefined));
        } else {
            setProfileIdByOwner(undefined);
        }
    }, [address, profile, router]);

    return (
        <main className={homeStyles.main}>
            <Header profileId={profileIdByOwner}/>

            <div className={styles.eventWrapper}>
                {
                    editing && isOwner() ?
                        <SubscriptionEdit data={subscription} profile={profile}/>
                        :
                        <Subscription
                            subscription={subscription}
                            profileOwnerAddress={profileOwnerAddress}
                            profile={profile}
                            paymentStatus={paymentStatus}
                            tgLinkStatus={tgLinkStatus}
                        />
                }
            </div>

            <Footer/>
        </main>
    );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    try {
        const subscriptionId = ctx.query!!.subscriptionId as `0x${string}`;
        const cookie = ctx.req.headers.cookie;


        console.log(`loading sub: ${subscriptionId}`);
        const subscription: UpdateSubscriptionDTO = await Api.subscription.loadSubscription(subscriptionId, cookie);

        const profileId = subscription.ownerId;

        let profile: ProfileDTO | undefined;
        const profilePromise = Api.profile.loadProfile(profileId, cookie).then(data => profile = data);

        let ownerAddress;
        const ownerPromise = Contract.profile
            .loadProfileOwner(profileId)
            .then((address) => (ownerAddress = address));

        let paymentStatus;
        const paymentStatusPromise = Api.subscription
            .paymentStatus({subscriptionId: subscriptionId}, cookie)
            .then(status => paymentStatus = status.status)
            .catch(e => {
                paymentStatus = 'NOT_PAID'
            })

        let tgLinkStatus;
        const tgLinkStatusPromise = Api.integration
            .getInviteLinkStatus(subscriptionId, cookie)
            .then(linkStatus => tgLinkStatus = linkStatus)
            .catch(e => {
                console.log(e);
                tgLinkStatus = null;
            });

        await Promise.all([profilePromise, ownerPromise, paymentStatusPromise, tgLinkStatusPromise]);
        if (!profile || !subscription) {
            return {
                redirect: {
                    destination: `/${profileId}`,
                    permanent: false,
                },
            }
        }

        return {
            props: {
                authStatus: getAuthStatus(ctx),
                subscription: subscription,
                profileOwnerAddress: ownerAddress,
                profile: {
                    id: profile.id,
                    title: profile.title,
                    logoId: profile.logoId,
                },
                paymentStatus: paymentStatus,
                tgLinkStatus: tgLinkStatus
            }
        };
    } catch (err) {
        console.log(err);
        // todo add redirecting here
        return {
            props: {
                subscription: undefined,
                profile: undefined
            }
        };
    }
};

export default SubscriptionPage;