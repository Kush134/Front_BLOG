import React, {useEffect, useState} from "react";
import styles from "@/styles/Profile.module.css";
import Logo from "@/components/logo/Logo";
import {Input} from "antd";
import SocialMediaList from "@/components/social_media_list/SocialMediaList";
import CustomButton from "@/components/customButton/CustomButton";
import {addressBySymbol, baseCoin, possibleTokens} from "@/utils/tokens";
import {LoadingOutlined} from "@ant-design/icons";
import * as Contract from "@/contract";
import {BaseProfile, MAX_DESCRIPTION_LEN, ProfileError} from "@/pages/profile/[profileId]";
import {tryBuildProfileImageLink} from "@/utils/s3";

interface Props {
    id: string;
    isLoading: boolean;
    setIsLoading: (disabled: boolean) => void;
    profile: BaseProfile | undefined;
    setProfile: (data: BaseProfile) => void;
    errors: ProfileError | undefined;
    tokens: string[];
}

const ProfileEdit: React.FC<Props> = ({
                                          id,
                                          isLoading,
                                          setIsLoading,
                                          profile = {
                                              id: id,
                                              title: "",
                                              description: "",
                                              logoId: undefined,
                                              newBase64Logo: undefined,
                                              socialMediaLinks: [],
                                          },
                                          setProfile,
                                          errors,
                                          tokens,
                                      }) => {
    const [availableTokens, setAvailableTokens] = useState<string[]>([]);
    useEffect(() => {
        setAvailableTokens(tokens);
    }, [tokens]);

    const logoDraggerHandler = (base64Logo: string | undefined) => {
        setProfile({
            ...profile, logoId: undefined, newBase64Logo: base64Logo
        });
    };

    const titleInputHandler = (title: string) => {
        setProfile({...profile, title: title});
    };

    const descriptionInputHandler = (description: string) => {
        setProfile({
            ...profile,
            description: description.slice(0, MAX_DESCRIPTION_LEN),
        });
    };

    const socialLinkHandler = (links: string[]) => {
        setProfile({...profile, socialMediaLinks: links});
    };

    /**
     * Enable / Disable tokens
     */
    const [processingToken, setProcessingToken] = useState<string | undefined>(
        undefined
    );
    const enableOrDisableToken = async (tokenSymbol: string) => {
        setIsLoading(true);
        setProcessingToken(tokenSymbol);
        try {
            const tokenAddress = addressBySymbol.get(tokenSymbol)!!;
            const enabled =
                availableTokens.find((token) => token === tokenSymbol) !== undefined;

            await Contract.profile.enableOrDisableToken(id, tokenAddress, !enabled);
            setAvailableTokens(await Contract.profile.loadAvailableTokens(id));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setProcessingToken(undefined);
        }
    };

    return (
        <div className={styles.gridWrapper}>
            <div className={styles.grid}>
                <Logo
                    isLoading={isLoading}
                    base64LogoUrl={profile.newBase64Logo ?? tryBuildProfileImageLink(profile.logoId)}
                    setBase64Logo={logoDraggerHandler}
                    editing={true}
                    hasError={errors?.logo}
                />
                <div
                    className={styles.profileDescription}
                    style={{gridArea: "description"}}
                >
                    <Input
                        disabled={isLoading}
                        status={errors?.title ? "error" : ""}
                        className={`${styles.titleInput} ${errors?.description && styles.errorBorder}`}
                        placeholder="Title"
                        value={profile.title}
                        onChange={(e) => titleInputHandler(e.target.value)}
                    />

                    <div
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            textAlign: "justify",
                        }}
                    >
                        <Input.TextArea
                            disabled={isLoading}
                            status={errors?.description ? "error" : ""}
                            className={`${styles.descriptionInput} ${errors?.description && styles.errorBorder}`}
                            value={profile.description}
                            onChange={(e) => descriptionInputHandler(e.target.value)}
                            autoSize={{minRows: 6, maxRows: 6}}
                            placeholder={`Add description. Max length is ${MAX_DESCRIPTION_LEN} characters.`}
                        />
                    </div>
                    <SocialMediaList
                        socialMediaLinks={profile.socialMediaLinks}
                        setSocialLinks={socialLinkHandler}
                        editing={!isLoading}
                        hasError={errors?.socialMediaLinks}
                    />
                </div>
            </div>
            <div
                className={styles.donateArea}
                style={{
                    gridArea: "donate",
                }}
            >
                <h2 style={{marginBottom: "48px"}}>
                    Please, choose tokens for donation:
                </h2>
                <div className={styles.donateButtonsWrapper}>
                    <CustomButton
                        key={baseCoin}
                        disabled={true}
                        style={{backgroundColor: "var(--primary-green-color)"}}
                        onClick={(e) => {
                        }}
                    >
                        {baseCoin.toUpperCase()}
                    </CustomButton>
                    {possibleTokens
                        .map((item) => item.symbol)
                        .map((symbol) => (
                            <CustomButton
                                disabled={isLoading}
                                key={symbol}
                                color={
                                    availableTokens.find((t) => t === symbol) === undefined
                                        ? "gray"
                                        : "green"
                                }
                                onClick={(e) => enableOrDisableToken(symbol)}
                            >
                                {symbol.toUpperCase()}{" "}
                                {symbol === processingToken ? <LoadingOutlined/> : ""}
                            </CustomButton>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
