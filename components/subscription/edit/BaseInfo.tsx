import ImageUploader from "@/components/imageUploader/ImageUploader";
import Image from "next/image";
import {ConfigProvider, Input, InputNumber, Select} from "antd";
import React from "react";
import styles from "@/styles/Subscription.module.css";
import {baseCoin, possibleTokens} from "@/utils/tokens";
import {BriefProfile} from "@/components/subscription/Subscription";
import {buildProfileImageLink, tryBuildSubscriptionImageLink} from "@/utils/s3";

export interface BaseInfoErrors {
    title: boolean;
    description: boolean;
    price: boolean;
    base64MainImg: boolean;
    base64PreviewImg: boolean;
}

export function hasError(errors: BaseInfoErrors): boolean {
    return (
        errors.title ||
        errors.description ||
        errors.price ||
        errors.base64MainImg ||
        errors.base64PreviewImg
    );
}

export interface BaseInfoData {
    title: string;
    description: string;
    mainImageId: string | undefined;
    newMainBase64Image: string | undefined;
    previewImageId: string | undefined;
    newPreviewBase64Image: string | undefined;
    price: number;
    coin: string;
}

interface Props {
    data: BaseInfoData;
    profile: BriefProfile;
    setter: (data: BaseInfoData) => void;
    isLoading: boolean;
    errors: BaseInfoErrors | undefined;
}

const BaseInfo: React.FC<Props> = ({
                                       data,
                                       profile,
                                       setter,
                                       isLoading,
                                       errors = {
                                           title: false,
                                           description: false,
                                           price: false,
                                           base64MainImg: false,
                                           base64PreviewImg: false,
                                       },
                                   }) => {
    const getErrorClassName = (flag: boolean): string => {
        return flag ? styles.eventError : "";
    };

    /**
     * Components
     */
    const availableCoinsSelector = () => {
        return (
            <Select
                bordered={false}
                disabled={isLoading}
                defaultValue={baseCoin}
                style={{width: 200, color: "#000 !important"}}
                onChange={(value) => setter({...data, coin: value})}
            >
                <Select.Option key={baseCoin} value={baseCoin}>
                    {baseCoin}
                </Select.Option>
                {possibleTokens.map((token) => {
                    return (
                        <Select.Option key={token.symbol} value={token.symbol}>
                            {token.symbol}
                        </Select.Option>
                    );
                })}
            </Select>
        );
    };

    return (
        <>
            <ConfigProvider
                theme={{
                    token: {
                        controlHeight: 64,
                        borderRadius: 14,
                        paddingSM: 24,
                        fontSize: 16,
                        fontFamily: "Montserrat",
                        colorPrimaryHover: "#fff",
                        colorBorder: "#fff",
                        colorFillAlter: "#fff",
                    },
                }}
            >
                <div className={styles.eventEditBaseInfoMainImageWrapper}>
                    <ImageUploader
                        disabled={isLoading}
                        description={"Add main picture"}
                        sizeText={"1050 x 320 px"}
                        hasError={errors.base64MainImg}
                        editing={true}
                        base64Img={data.newMainBase64Image ?? tryBuildSubscriptionImageLink(data.mainImageId)}
                        setBase64Img={(img) =>
                            setter({
                                ...data,
                                mainImageId: undefined,
                                newMainBase64Image: img,
                            })
                        }
                    />
                </div>

                <div className={styles.eventEditBaseInfoTitleWrapper}>
                    <div className={styles.eventEditBaseInfoLogoWrapper}>
                        <Image
                            src={buildProfileImageLink(profile!!.logoId)}
                            alt={"Community logo"}
                            style={{borderRadius: "20px"}}
                            fill
                        />
                    </div>

                    <Input
                        disabled={isLoading}
                        className={`${styles.inputShadow} ${
                            styles.eventEditBaseInfoTitle
                        } ${getErrorClassName(errors.title)}`}
                        style={{
                            fontFamily: "var(--font-montserrat)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                        placeholder={"Add title"}
                        value={data.title}
                        onChange={(e) => setter({...data, title: e.target.value})}
                    />
                </div>

                <div className={styles.eventEditBaseInfoPriceWrapper}>
                    <InputNumber
                        bordered={false}
                        className={`${getErrorClassName(errors.price)}`}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            borderRadius: "14px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        }}
                        type="number"
                        controls={false}
                        value={data.price}
                        min={0}
                        max={Number.MAX_SAFE_INTEGER}
                        addonAfter={availableCoinsSelector()}
                        placeholder="Please enter a donation amount"
                        onChange={(value) =>
                            setter({...data, price: value ? value : 0.0})
                        }
                    />
                </div>

                <div className={styles.eventEditBaseInfoSecondWrapper}>
                    <div className={styles.eventEditBaseInfoPreviewImageWrapper}>
                        <ImageUploader
                            disabled={isLoading}
                            description={"Add preview picture"}
                            sizeText={"300 x 300 px"}
                            hasError={errors.base64PreviewImg}
                            editing={true}
                            base64Img={data.newPreviewBase64Image ?? tryBuildSubscriptionImageLink(data.previewImageId)}
                            setBase64Img={(img) =>
                                setter({
                                    ...data,
                                    previewImageId: undefined,
                                    newPreviewBase64Image: img,
                                })
                            }
                        />
                    </div>
                    <div className={styles.eventEditBaseInfoDescriptionWrapper}>
                        {/* todo don't use bold font here */}
                        <Input.TextArea
                            bordered={false}
                            disabled={isLoading}
                            className={`${
                                styles.eventEditBaseInfoDescription
                            } ${getErrorClassName(errors.description)}`}
                            // can't move it to classname, because it doesn't work
                            style={{
                                resize: "none",
                                height: "300px",
                                fontFamily: "var(--font-montserrat)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            }}
                            placeholder={"Add description"}
                            value={data.description}
                            onChange={(e) => setter({...data, description: e.target.value})}
                        />
                    </div>
                </div>
            </ConfigProvider>
        </>
    );
};

export default BaseInfo;
