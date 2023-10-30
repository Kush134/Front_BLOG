import {SubscriptionStatus, UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import Image from "next/image";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import {EditOutlined, LoadingOutlined, ShareAltOutlined} from "@ant-design/icons";
import {useRouter} from "next/router";
import CustomButton from "@/components/customButton/CustomButton";
import React, {ReactNode, useState} from "react";
import {Input, message, Modal} from "antd";
import {ethers} from "ethers";
import * as Api from "@/api";
import * as Contract from "@/contract";
import {useAccount, useBalance} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {GetInviteLinkStatusType, TgChatStatusDTO} from "@/api/dto/integration.dto";
import Link from "next/link";
import {buildProfileImageLink, buildSubscriptionImageLink} from "@/utils/s3";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {TgBotLink} from "@/components/subscription/integration/Integration";

export interface BriefProfile {
    id: string;
    title: string;
    logoId: string;
}

interface Props {
    subscription: UpdateSubscriptionDTO,
    profileOwnerAddress: string,
    profile: BriefProfile,
    paymentStatus: 'PAID' | 'NOT_PAID',
    tgLinkStatus?: TgChatStatusDTO
}

const Subscription: React.FC<Props> = (
    {
        subscription,
        profileOwnerAddress,
        profile,
        paymentStatus: _paymentStatus,
        tgLinkStatus: _tgLinkStatus
    }
) => {
    const router = useRouter()
    const {isConnected, address} = useAccount();
    const {openConnectModal} = useConnectModal();

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [subscriptionStatus, setSubscriptionStatus] = useState(subscription.status);
    const [paymentStatus, setPaymentStatus] = useState(_paymentStatus);
    const [tgLinkStatus, setTgLinkStatus] = useState(_tgLinkStatus);

    const {data: baseBalanceResponse} = useBalance({
        address: address,
    });

    const openCloseModal = () => setIsShareModalOpen((prev) => !prev);

    const isOwner = () => isConnected && profileOwnerAddress === address && subscription.ownerId === profile.id;

    const getPath = () => {
        const origin =
            typeof window !== "undefined" && window.location.origin
                ? window.location.origin
                : "";

        return `${origin}${router.asPath}`;
    };

    const getButtonText = (status: SubscriptionStatus) => {
        switch (status) {
            case "DRAFT":
                return 'Continue editing';
            case "NOT_PAID":
                return 'Pay';
            case "PAYMENT_PROCESSING":
                return 'Check payment';
            case "UNPUBLISHED":
                return 'Publish';
            case "PUBLISHED":
                return 'Unpublish';
        }
    }

    const executeBaseOnSatus = async (status: SubscriptionStatus) => {
        switch (status) {
            case "DRAFT":
                routeToEditing();
                return;
            case "NOT_PAID":
                await pay();
                return;
            case "PAYMENT_PROCESSING":
                await processPayment(subscription.id);
                return;
            case "UNPUBLISHED":
                await Api.subscription.publish({subscriptionId: subscription.id});
                setSubscriptionStatus('PUBLISHED');
                return;
            case "PUBLISHED":
                await Api.subscription.unpublish({subscriptionId: subscription.id});
                setSubscriptionStatus('UNPUBLISHED');
                return;
        }
    }

    const routeToEditing = () => {
        router.push(`/subscription/${subscription.id}?editing=true`);
    }

    const pay = async () => {
        try {
            setIsLoading(true);

            const ethersPrice = ethers.utils.parseEther(subscription.price);

            await Contract.subscription.createNewSubscriptionByEth(subscription.id, profile!!.id, ethersPrice)
            setSubscriptionStatus('PAYMENT_PROCESSING');
            await processPayment(subscription.id);
        } catch (e) {
            console.error('Catch error during pay');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const processPayment = async (id: string) => {
        const status = await Api.subscription.processPayment({subscriptionId: id});
        setSubscriptionStatus(status);
    }

    const subscribe = async () => {
        if (!isConnected) {
            openConnectModal!!();
            return;
        }
        try {
            setIsLoading(true);
            const index = await Contract.subscription.getIndexByHexId(subscription.id);
            await Contract.subscription.payForSubscriptionByEth(subscription.id, profile.id, Number(index), subscription.price);
            message.success("Successful payment");
            router.reload();
        } catch (e: any) {
            console.log(e);
            if (e?.code === -32603) {
                message.error("Insufficient funds in your wallet.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const generateInviteCode = async () => {
        try {
            setIsLoading(true);
            const code = (await Api.integration.generateInviteCode(subscription.id)).code;
            setTgLinkStatus({status: GetInviteLinkStatusType.CODE_GENERATED, code: code});
        } catch (e) {
            router.reload();
        } finally {
            setIsLoading(false);
        }
    }

    const getPaidButtonText = (tgLinkStatus: TgChatStatusDTO | undefined): ReactNode => {
        if (tgLinkStatus?.status === undefined) {
            return (
                <CustomButton
                    disabled={isLoading}
                    type="wide"
                    color={"green"}
                    onClick={() => router.reload()}
                >
                    Refresh page
                </CustomButton>
            );
        }

        if (tgLinkStatus.status === GetInviteLinkStatusType.CODE_GENERATED) {
            return (
                <CopyToClipboard text={tgLinkStatus.code!!}>
                    <Link href={TgBotLink} target={'_blank'}>
                        <CustomButton
                            disabled={isLoading}
                            type="wide"
                            color={"green"}
                            onClick={() => {
                            }}
                        >
                            Copy invite code and Go to telegram
                        </CustomButton>
                    </Link>
                </CopyToClipboard>
            );
        }
        if (tgLinkStatus.status === GetInviteLinkStatusType.NOT_GENERATED) {
            return (
                <CustomButton
                    disabled={isLoading}
                    type="wide"
                    color={"green"}
                    onClick={generateInviteCode}
                >
                    Generate invite code
                </CustomButton>
            );
        }
        if (tgLinkStatus.status === GetInviteLinkStatusType.CODE_USED) {
            return (
                <Link href={TgBotLink} target={'_blank'}>
                    <CustomButton
                        disabled={isLoading}
                        type="wide"
                        color={"green"}
                        onClick={() => {
                        }}
                    >
                        Go to telegram
                    </CustomButton>
                </Link>
            );
        }

        return (
            <CustomButton
                disabled={isLoading}
                type="wide"
                color={"green"}
                onClick={() => router.reload()}
            >
                Refresh page
            </CustomButton>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                marginTop: "80px",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "320px",
                }}
            >
                <Image
                    src={buildSubscriptionImageLink(subscription.mainImageId!!)}
                    alt={"Subscription main image"}
                    style={{borderRadius: "20px"}}
                    fill
                />
            </div>

            <div
                style={{
                    paddingTop: "32px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "32px",
                    fontFamily: "co-headline",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "64px",
                            height: "64px",
                            cursor: "pointer",
                        }}
                        onClick={(e) => router.push(`/profile/${profile.id}`)}
                    >
                        <Image
                            src={buildProfileImageLink(profile.logoId)}
                            alt={"Profile image"}
                            style={{borderRadius: "20px"}}
                            fill
                        />
                    </div>
                    <p style={{paddingLeft: "18px"}}>{profile.title}</p>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <p style={{paddingRight: "18px"}}>WHERE:</p>
                    <div
                        style={{
                            position: "relative",
                            width: "64px",
                            height: "64px",
                        }}
                    >
                        <Image
                            src={telegramIcon}
                            alt={"Social media image"}
                            style={{borderRadius: "20px"}}
                            fill
                        />
                    </div>
                </div>
            </div>

            <div
                style={{
                    paddingTop: "30px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <p style={{fontSize: "48px", fontFamily: "co-headline"}}>
                    {subscription.title}
                </p>
                <div>
                    <CustomButton
                        color={"gray"}
                        style={{
                            minWidth: "55px",
                            height: "55px",
                            marginRight: `${isOwner() ? "16px" : "0"}`,
                        }}
                        onClick={() => openCloseModal()}
                    >
                        <ShareAltOutlined style={{width: "32px"}}/>
                    </CustomButton>
                    {isOwner() && (
                        <CustomButton
                            color={"gray"}
                            style={{minWidth: "55px", height: "55px", marginRight: "16px"}}
                            onClick={routeToEditing}
                        >
                            <EditOutlined style={{width: "32px"}}/>
                        </CustomButton>
                    )}
                </div>
            </div>

            <div style={{marginTop: '30px'}}>
                {!isOwner() &&
                    <>
                        {paymentStatus === 'PAID' &&
                            getPaidButtonText(tgLinkStatus)
                        }
                        {paymentStatus === 'NOT_PAID' &&
                            <CustomButton
                                disabled={isLoading}
                                type="wide"
                                color={"green"}
                                onClick={subscribe}
                            >
                                Subscribe {subscription.price} {subscription.coin.toUpperCase()} {isLoading &&
                                <LoadingOutlined/>}
                            </CustomButton>}
                    </>
                }
                {
                    isOwner() &&
                    <CustomButton
                        disabled={isLoading}
                        type="wide"
                        color={"green"}
                        onClick={() => executeBaseOnSatus(subscriptionStatus)}
                    >
                        {getButtonText(subscriptionStatus)} {isLoading && <LoadingOutlined/>}
                    </CustomButton>
                }
            </div>

            <div
                style={{
                    margin: "50px 0 128px",
                    width: "100%",
                    fontSize: "21px",
                    whiteSpace: "pre-wrap",
                    textAlign: 'justify',
                }}
            >
                {subscription.description}
            </div>
            <Modal
                centered
                open={isShareModalOpen}
                onCancel={openCloseModal}
                footer={null}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "32px",
                        width: "400px",
                    }}
                >
                    <h3 style={{marginBottom: "32px"}}>Share the subscription</h3>
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                        }}
                    >
                        <Input
                            style={{padding: "16px", width: "100%", marginRight: "20px"}}
                            readOnly
                            value={getPath()}
                            placeholder="Subscription link"
                        />
                        <CopyToClipboard text={getPath()} onCopy={() => message.success('Copied')}>
                            <CustomButton
                                type="small"
                                style={{minWidth: "100px", fontSize: "16px"}}
                                color={"green"}
                                onClick={() => {
                                }}
                            >
                                Copy
                            </CustomButton>
                        </CopyToClipboard>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Subscription
