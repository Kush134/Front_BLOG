import styles from "@/styles/Subscription.module.css";
import {message} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {ethers} from "ethers";
import {UpdateSubscriptionDTO} from "@/api/dto/subscription.dto";
import {baseCoin} from "@/utils/tokens";

import * as Api from '@/api'

import BaseInfo, {BaseInfoData, BaseInfoErrors, hasError} from "@/components/subscription/edit/BaseInfo";
import {BriefProfile} from "@/components/subscription/Subscription";
import Integration from "@/components/subscription/integration/Integration";
import CustomButton from "@/components/customButton/CustomButton";
import {hasChanges} from "@/utils/compare";
import {ChatBindingStatus, TgChatDTO} from "@/api/dto/integration.dto";

// todo maybe extract it later
function toBaseInfoDataOrDefault(dto: UpdateSubscriptionDTO | undefined): BaseInfoData {
    if (!dto) {
        return {
            title: '',
            description: '',
            mainImageId: undefined,
            newMainBase64Image: undefined,
            previewImageId: undefined,
            newPreviewBase64Image: undefined,
            price: 0.0,
            coin: baseCoin,
        };
    }
    return {
        title: dto.title,
        description: dto.description,
        mainImageId: dto.mainImageId,
        newMainBase64Image: undefined,
        previewImageId: dto.previewImageId,
        newPreviewBase64Image: undefined,
        price: Number.parseFloat(dto.price),
        coin: dto.coin,
    }
}

interface Props {
    data: UpdateSubscriptionDTO | undefined;
    profile: BriefProfile
}

const SubscriptionEdit: React.FC<Props> = ({data, profile}) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    // this field contains top-level data to understand if there are changes
    // and updated after saving in db
    const [lastDbData, setLastDbData] = useState<UpdateSubscriptionDTO | undefined>(data);
    const [baseInfoData, setBaseInfoData] = useState<BaseInfoData>(toBaseInfoDataOrDefault(data));
    const [chat, setChat] = useState<TgChatDTO | undefined>(undefined);

    /**
     * Errors are undefined before calling 'next'
     */
    const [errors, setErrors] = useState<BaseInfoErrors | undefined>(undefined);

    const next = async () => {
        if (currentStep === 0) {
            await saveSubscriptionDraft(baseInfoData)
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    useEffect(() => {
        errors && isValid(baseInfoData, errors);
    }, [errors, baseInfoData]);

    /**
     * Save subscription
     */
    const saveSubscriptionDraft = async (
        baseInfo: BaseInfoData | undefined
    ) => {
        setIsLoading(true);
        try {
            if (!isValid(baseInfo, errors)) {
                console.log(baseInfo);
                console.log(errors);
                return;
            }

            const oldId = lastDbData?.id;
            const isNewSub = oldId === undefined;
            const id = (isNewSub ? ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uuidv4())) : oldId!!) as `0x${string}`;
            const price = baseInfo!!.price.toString();

            if (!lastDbData || hasChanges(toBaseInfoDataOrDefault(lastDbData), baseInfo!!)) {
                const request: UpdateSubscriptionDTO = {
                    id: id,
                    ownerId: profile!!.id,
                    status: isNewSub ? 'DRAFT' : lastDbData!!.status,
                    title: baseInfo!!.title,
                    description: baseInfo!!.description,
                    mainImageId: baseInfo?.mainImageId,
                    newMainBase64Image: baseInfo?.newMainBase64Image,
                    previewImageId: baseInfo?.previewImageId,
                    newPreviewBase64Image: baseInfo?.newPreviewBase64Image,
                    price: price,
                    coin: baseInfo!!.coin,
                };
                await Api.subscription.updateSubscription(request);
                setLastDbData(request);
            }

            const chat = await Api.integration.getChat(id);
            if (chat.status === ChatBindingStatus.BINDED) {
                setChat(chat);
            }
            setCurrentStep(old => old + 1);
        } catch (e) {
            console.error(e);
            console.error(`Catch error during updating subscription.`);
        } finally {
            setIsLoading(false);
        }
    }

    const isValid = (data: BaseInfoData | undefined, errors: BaseInfoErrors | undefined): boolean => {
        const updatedErrors: BaseInfoErrors = !errors ? {
            title: false,
            description: false,
            price: false,
            base64MainImg: false,
            base64PreviewImg: false,
        } : errors;

        updatedErrors.title = !data || data.title.trim().length === 0;
        updatedErrors.description = !data || data.description.trim().length === 0 || data.description.length > 2000;
        updatedErrors.price = !data || data.price <= 0;
        updatedErrors.base64MainImg = !data || !data.mainImageId && !data.newMainBase64Image;
        updatedErrors.base64PreviewImg = !data || !data.previewImageId && !data.newPreviewBase64Image;

        setErrors(updatedErrors);
        return !hasError(updatedErrors);
    }

    /**
     * Steps
     */
    const steps = [
        {
            title: 'CREATE SUBSCRIPTION',
            subTitle: 'Subscription editing',
            content: <BaseInfo
                data={baseInfoData}
                profile={profile}
                setter={setBaseInfoData}
                isLoading={isLoading}
                errors={errors}/>,
        },
        {
            title: 'CREATE SUBSCRIPTION',
            subTitle: 'Connect with platform',
            content:
                <>
                    {lastDbData && <Integration
                        topLvlChat={chat}
                        subscriptionId={lastDbData!!.id as `0x${string}`}
                        previousCallback={() => prev()}
                        doneCallback={() => {
                            message.success('Processing complete!');
                            router.push(`/subscription/${lastDbData!!.id}?profileId=${profile.id}`);
                        }}/>}
                </>,
        },
    ];

    return (
        <div className={styles.eventWrapper}>
            <div style={{width: "100%"}}>
                <p className={styles.eventEditTitle}>{steps[currentStep].title}</p>
                <p className={styles.eventEditSubTitle}>{steps[currentStep].subTitle}</p>

                <div>{steps[currentStep].content}</div>

                <div className={styles.eventButtonWrapper}>
                    {currentStep === 0 && <CustomButton
                        style={{marginRight: '20px'}}
                        type={"small"}
                        color={"gray"}
                        disabled={isLoading}
                        onClick={() => router.push(`/profile/${profile!!.id}`)}>
                        Back to profile
                    </CustomButton>
                    }

                    {currentStep === 0 &&
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={next}>
                            {data?.id ? "Update" : "Create"} {isLoading && <LoadingOutlined/>}
                        </CustomButton>
                    }
                </div>
            </div>
        </div>
    );
}

export default SubscriptionEdit;