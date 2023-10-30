import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import styles_header from "@/styles/Header.module.css";
import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/router";
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite,} from "wagmi";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import CustomButton from "@/components/customButton/CustomButton";
import CustomAlert from "@/components/alert/CustomAlert";
import {MAIN_NFT_ABI, MAIN_NFT_ADDRESS, WAIT_BLOCK_CONFIRMATIONS,} from "@/constants";
import {BigNumber} from "ethers";
import {waitForTransaction} from "@wagmi/core";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {LoadingOutlined} from "@ant-design/icons";
import {AuthProps} from "@/pages/_app";
import {GetServerSidePropsContext, NextPage} from "next";
import {getAuthStatus} from "@/utils/getAuthStatus";
import {buildProfileImageLink} from "@/utils/s3";

import * as Api from "@/api";
import {BaseProfileDTO} from "@/api/dto/profile.dto";


interface BriefProfileInfo {
    id: string,
    logoId: string;
    title: string,
}

interface Props extends AuthProps {
    topProfiles: BriefProfileInfo[]
}

const Home: NextPage<Props> = ({topProfiles}) => {
    const router = useRouter();
    const {address, isConnected} = useAccount();
    const [priceToMint, setPriceToMint] = useState<BigNumber | undefined>(
        undefined
    );
    const [userProfileId, setUserProfileId] = useState<number | undefined>(
        undefined
    );
    const [isSticky, setIsSticky] = useState(false);
    const [pageIsReady, setPageIsReady] = useState(false);
    const arrowRef = useRef<HTMLDivElement>(null);
    const {openConnectModal} = useConnectModal();
    const [error, setError] = useState<string>("");

    // It's a workaround,
    // details - https://ethereum.stackexchange.com/questions/133612/error-hydration-failed-because-the-initial-ui-does-not-match-what-was-rendered
    const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
    useEffect(() => {
        if (isConnected) {
            setIsDefinitelyConnected(true);
        } else {
            setIsDefinitelyConnected(false);
        }
    }, [isConnected]);

    /**
     * Loading price to mint
     */
    const {data: priceToMintData, isSuccess: isPriceToMintDataSuccess} =
        useContractRead({
            address: MAIN_NFT_ADDRESS,
            abi: MAIN_NFT_ABI,
            functionName: "priceToMint",
            args: [address],
        });

    useEffect(() => {
        if (isPriceToMintDataSuccess) {
            setPriceToMint(priceToMintData as BigNumber);
        }
    }, [priceToMintData, isPriceToMintDataSuccess]);

    useEffect(() => {
        if (isDefinitelyConnected && userProfileId) {
            router.prefetch(`/profile/${userProfileId}`);
            setPageIsReady(true);
        }
    }, [isDefinitelyConnected, router, userProfileId]);

    const redirectClick = (id: number) => {
        setPageIsReady(false);
        router.push(`/profile/${id}`);
    };

    /**
     * Loading address tokens.
     *
     * I can't find a way to check if a user has a profile, so it's a workaround.
     *
     * success => has profile
     * error => no profile
     */
    const {
        data: tokenOfOwnerByIndexData,
        isSuccess: isTokenOfOwnerByIndexSuccess,
        refetch: tokenOfOwnerByIndexRefetch,
    } = useContractRead({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: "tokenOfOwnerByIndex",
        args: [address, 0],
    });

    useEffect(() => {
        if (isTokenOfOwnerByIndexSuccess) {
            setUserProfileId(tokenOfOwnerByIndexData as number);
        } else {
            setUserProfileId(undefined);
        }
    }, [
        priceToMintData,
        isPriceToMintDataSuccess,
        isTokenOfOwnerByIndexSuccess,
        tokenOfOwnerByIndexData,
    ]);

    const {config: safeMintConfig} = usePrepareContractWrite({
        address: MAIN_NFT_ADDRESS,
        abi: MAIN_NFT_ABI,
        functionName: "safeMint",
        overrides: {
            value: priceToMint,
        },
    });

    const [isMinting, setIsMinting] = useState(false);
    const {
        writeAsync: safeMintWriteAsync,
        error: safeMintWriteError,
        status: safeMintStatus,
    } = useContractWrite(safeMintConfig);

    useEffect(() => {
        if (safeMintWriteError) {
            console.log(safeMintWriteError.message);
            setError(safeMintWriteError.message);
        }
        console.log(safeMintStatus);
    }, [safeMintWriteError, safeMintStatus]);

    const mint = async () => {
        if (!priceToMint) {
            console.error("Can't load mint price.");
            setError("Can't load mint price.");
            return;
        }

        if (!safeMintWriteAsync) {
            setError("Insufficient funds in your wallet.");
            return;
        }

        setIsMinting((old) => !old);

        safeMintWriteAsync?.()
            .then((data) => {
                console.log(`Wait tx: ${data.hash}`);
                return waitForTransaction({
                    hash: data.hash,
                    confirmations: WAIT_BLOCK_CONFIRMATIONS,
                });
            })
            .then((_) => tokenOfOwnerByIndexRefetch())
            .then((response) => {
                if (response.error) throw Error(response.error.message);
                redirectClick((response.data as BigNumber).toNumber());
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);

                setIsMinting(false);
            });
    };

    useEffect(() => {
        const handleScroll = () => {
            const logo = document.querySelector(`#logo_nodde`);
            if (logo) {
                const logoRect = logo.getBoundingClientRect();
                setIsSticky(logoRect.top <= 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        if (arrowRef.current) {
            arrowRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    const [showAlert, setShowAlert] = useState(false);
    const handleAlerShow = () => {
        setShowAlert(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    return (
        <>
            {showAlert && (
                <CustomAlert type="warning" onClose={handleAlertClose}>
                    Firstly, connect your wallet to the platform
                </CustomAlert>
            )}

            {error && (
                <CustomAlert type="error" onClose={() => setError("")}>
                    {error}
                </CustomAlert>
            )}

            <Head>
                <title>Nodde community</title>
                <meta
                    name="description"
                    content="Web3 application for closed sessions, streams, other events, and donations"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <Header
                    showLogo={isSticky}
                    profileId={userProfileId?.toString()}
                />

                <div className={styles.center}>
                    <div className={styles.welcome_content}>
                        <div className={styles.welcome_content_left_side}>
                            <h1>Welcome to</h1>
                            <div id="logo_nodde" className={styles_header.logo_nodde}></div>
                        </div>
                        <div className={styles.welcome_content_right_side}>
                            <div className={styles.home_image_0}></div>
                        </div>
                    </div>
                    <p
                        style={{
                            marginBottom: "76px",
                            fontSize: "32px",
                        }}
                    >
                        Create content for your subscribers and receive donates in one click with Web 3 technologies
                    </p>
                    <h1>Build you own community</h1>
                    <div
                        id="arrow"
                        className={styles.arrow}
                        onClick={handleClick}
                        ref={arrowRef}
                    ></div>
                    <div className={styles.section_wrapper}>
                        {!isDefinitelyConnected && (
                            <div className={styles.section_sub_wrapper}>
                                <p
                                    style={{
                                        marginBottom: "20px",
                                        fontSize: "32px",
                                        textAlign: "center",
                                    }}
                                >
                                    To use platform connect you wallet firstly
                                </p>
                                <CustomButton
                                    color="white"
                                    onClick={openConnectModal}
                                    style={{
                                        width: "324px",
                                        fontSize: "21px",
                                        marginBottom: "70px",
                                    }}
                                    disabled={isDefinitelyConnected}
                                >
                                    🌈 Connect wallet
                                </CustomButton>
                            </div>
                        )}
                        {isDefinitelyConnected && !userProfileId && (
                            <div className={styles.section_sub_wrapper}>
                                <p
                                    style={{
                                        marginBottom: "20px",
                                        fontSize: "32px",
                                        textAlign: "center",
                                    }}
                                >
                                    Create your NFT profile
                                </p>
                                <CustomButton
                                    color="white"
                                    onClick={!isDefinitelyConnected ? handleAlerShow : mint}
                                    style={{
                                        width: "324px",
                                        fontSize: "21px",
                                        marginBottom: "70px",
                                    }}
                                    disabled={isMinting || !isDefinitelyConnected}
                                >
                                    {isMinting ? <LoadingOutlined/> : "🚀"} Create a profile
                                </CustomButton>
                            </div>
                        )}
                        {isDefinitelyConnected && userProfileId && (
                            <div className={styles.section_sub_wrapper}>
                                <p
                                    style={{
                                        marginBottom: "20px",
                                        fontSize: "32px",
                                        textAlign: "center",
                                    }}
                                >
                                    Set your profile
                                </p>
                                <CustomButton
                                    color="white"
                                    onClick={() => redirectClick(userProfileId)}
                                    style={{
                                        width: "324px",
                                        fontSize: "21px",
                                        marginBottom: "70px",
                                    }}
                                    disabled={!pageIsReady}
                                >
                                    {!pageIsReady ? <LoadingOutlined/> : "🚀"} Let's go right now
                                </CustomButton>
                            </div>
                        )}
                        <h2 style={{alignSelf: "start"}}>VIEW TOP PROFILES</h2>
                        <div className={styles.topProfileWrapper}>
                            <div className={styles.topProfileContainer}>
                                {topProfiles &&
                                    topProfiles.map((baseData) => (
                                        <div
                                            key={baseData.id}
                                            className={styles.topProfileContainerWrapper}>
                                            <Image
                                                src={buildProfileImageLink(baseData.logoId!!)}
                                                alt={"Profile logo"}
                                                fill
                                                className={styles.topProfileImage}
                                                onClick={(e) =>
                                                    router.push(`/profile/${baseData.id}`)
                                                }
                                            />
                                            <p className={`${styles.topProfileTitle}`}>
                                                {baseData.title}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </main>
        </>
    );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {

    const defaultProfileIds = [1, 2, 7];

    const fromProfileDTO = (dto: BaseProfileDTO): BriefProfileInfo => {
        return {
            id: dto.id,
            title: dto.title,
            logoId: dto.logoId,
        };
    };

    console.log("Load top profiles ....");
    const topProfiles: BriefProfileInfo[] = [];
    const profilesPromises: Promise<void>[] = [];

    try {
        for (let index in defaultProfileIds) {
            const profilePromise = Api.profile
                .loadProfile(defaultProfileIds[index].toString(), null)
                .then((profile) => {
                    if (profile) {
                        topProfiles.push(fromProfileDTO(profile));
                    }
                });
            profilesPromises.push(profilePromise);
        }
    } catch (error) {
        console.log(error);
    }

    await Promise.all(profilesPromises);

    topProfiles.sort(function (a, b) {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });

    return {
        props: {
            authStatus: getAuthStatus(ctx),
            topProfiles: topProfiles
        },
    };
};

export default Home;
