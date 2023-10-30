import {useRouter} from "next/router";
import styles from "@/styles/Home.module.css";
import React, {useEffect, useState} from "react";
import Header from "@/components/header/Header";
import {useAccount} from "wagmi";
import {GetServerSidePropsContext, NextPage} from "next";
import {BaseProfileDTO, ProfileDTO} from "@/api/dto/profile.dto";
import Footer from "@/components/footer/Footer";
import ProfileEdit from "@/components/profile/edit/ProfileEdit";
import Profile from "@/components/profile/Profile";
import EditeProfileButton from "@/components/profile/EditeProfileButton";

import * as Api from "@/api";
import * as Contract from "@/contract";
import {hasChanges} from "@/utils/compare";
import {getAuthStatus} from "@/utils/getAuthStatus";
import {getAuthCookie} from "@/utils/cookie";
import {AuthProps} from "@/pages/_app";

export interface ProfileError {
    logo: boolean;
    title: boolean;
    description: boolean;
    socialMediaLinks: boolean;
}

const hasError = (error: ProfileError | undefined) => {
    return (
        error &&
        (error.logo || error.title || error.description || error.socialMediaLinks)
    );
};

export interface BaseProfile {
    id: string;
    title: string;
    description: string;
    logoId?: string;
    newBase64Logo?: string;
    socialMediaLinks: string[];
}

const fromProfileDTO = (dto: BaseProfileDTO): BaseProfile => {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        logoId: dto.logoId,
        newBase64Logo: undefined,
        socialMediaLinks: dto.socialMediaLinks,
    };
};

export const MAX_DESCRIPTION_LEN = 220;

interface Props extends AuthProps {
    profile?: ProfileDTO;
    ownerAddress: string;
    tokens: string[];
}

const ProfilePage: NextPage<Props> = ({authStatus, profile, ownerAddress, tokens}) => {

    const {address, isConnected} = useAccount();

    const router = useRouter();
    const {profileId} = router.query;

    const [isLoading, setIsLoading] = useState(false);
    const [editing, setEditing] = useState(!profile);

    const [baseData, setBaseData] = useState<BaseProfile | undefined>(undefined);
    const [profileError, setProfileError] = useState<ProfileError | undefined>(undefined);

    const [profileIdByOwner, setProfileIdByOwner] = useState<string | undefined>(undefined);

    const isOwner = () => isConnected && authStatus === 'authenticated' && address === ownerAddress;


    useEffect(() => {
        setBaseData(profile ? fromProfileDTO(profile) : undefined);
        setEditing(!profile);

        if (!profile && (!isConnected || address !== ownerAddress)) {
            router.push("/");
            return;
        }
        if (isConnected && address) {
            Contract.profile
                .getProfileIdByOwnerAndIndex(address, 0)
                .then((profileIdByOwner) => setProfileIdByOwner(profileIdByOwner))
                .catch(() => setProfileIdByOwner(undefined));
        } else {
            setProfileIdByOwner(undefined)
        }
    }, [ownerAddress, isConnected, address, profile, router]);

    const getError = (baseData: BaseProfile | undefined) => {
        const hasLogoError = !baseData?.logoId && !baseData?.newBase64Logo;
        const hasTitleError = !baseData?.title;
        const hasDescriptionError = !baseData?.description || baseData?.description.length > MAX_DESCRIPTION_LEN;
        const hasSocialLinksError = !baseData?.socialMediaLinks || baseData.socialMediaLinks.length === 0;

        return {
            logo: hasLogoError,
            title: hasTitleError,
            description: hasDescriptionError,
            socialMediaLinks: hasSocialLinksError,
        };
    }

    useEffect(() => {
        if (profileError === undefined) return;
        setProfileError(getError(baseData))
    }, [baseData, setProfileError]);

    /**
     * Updating profile
     */
    const saveCallback = async () => {
        console.log("Save profile callback....");
        try {
            setIsLoading(true);
            const errors = getError(baseData);
            if (hasError(errors) || !baseData) {
                setProfileError(errors);
                return;
            }
            if (
                !profile ||
                hasChanges(baseData, fromProfileDTO(profile))
            ) {
                const updatedProfile = await Api.profile.updateProfile({
                    id: profileId!! as string,
                    title: baseData.title,
                    description: baseData.description,
                    logoId: baseData.logoId,
                    newBase64Image: baseData.newBase64Logo,
                    socialMediaLinks: baseData.socialMediaLinks,
                });
                setBaseData(fromProfileDTO(updatedProfile));
            }

            setEditing(false);
        } catch (e) {
            console.error(`Catch error during updating profile. Error: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <Header profileId={profileIdByOwner as string}>
                {isOwner() && (
                    <EditeProfileButton
                        saveCallback={saveCallback}
                        edited={editing}
                        setEdited={setEditing}
                        disabled={isLoading}
                    />
                )}
            </Header>

            {editing &&
                <ProfileEdit
                    id={profileId as string}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    profile={baseData}
                    setProfile={setBaseData}
                    errors={profileError}
                    tokens={tokens}
                />
            }
            {!editing && baseData &&
                <Profile
                    baseData={baseData!!}
                    tokens={tokens}
                    subscriptions={profile?.subscriptions ?? []}
                    isOwner={isOwner()}
                />
            }
            <Footer/>
        </main>
    );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    try {
        const profileId = ctx.params!!.profileId as string;

        console.log(`Load profile ${profileId}`);

        const props: Props = {
            authStatus: getAuthStatus(ctx),
            tokens: [],
            ownerAddress: "",
            profile: undefined,
        };

        const tokensPromise = Contract.profile
            .loadAvailableTokens(profileId)
            .then((tokens) => (props.tokens = tokens));

        const profilePromise = Api.profile
            // todo mb remove cookie here
            .loadProfile(profileId, getAuthCookie(ctx))
            .then((profile) => (props.profile = profile ?? null));

        const ownerPromise = Contract.profile
            .loadProfileOwner(profileId)
            .then((ownerAddress) => (props.ownerAddress = ownerAddress));

        await Promise.all([tokensPromise, profilePromise, ownerPromise]);

        return {
            props: props,
        };
    } catch (err) {
        console.log(err);
        // todo add redirecting here
        return {
            props: {profile: null, tokens: [], subscriptions: []},
        };
    }
};

export default ProfilePage;
