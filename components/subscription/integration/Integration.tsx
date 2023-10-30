import React, {ReactNode, useEffect, useState} from "react";
import {ConfigProvider, Input, Select} from "antd";
import styles from "@/styles/Subscription.module.css";
import CustomButton from "@/components/customButton/CustomButton";
import * as Api from "@/api";
import {TgChatDTO} from "@/api/dto/integration.dto";
import Link from "next/link";

enum Platform {
    Telegram = "Telegram",
}

interface Props {
    topLvlChat: TgChatDTO | undefined,
    subscriptionId: `0x${string}`,
    previousCallback: () => void;
    doneCallback: () => void;
}

const TgBotName = 'nodde_bot';
export const TgBotLink = `https://t.me/${TgBotName}`;
const savingStepIndex = 1;
const finalStepIndex = 2;

const Integration: React.FC<Props> = ({topLvlChat, subscriptionId, previousCallback, doneCallback}) => {

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [platform, setPlatform] = useState<string>(Platform.Telegram.toString());
    const [code, setCode] = useState<string>('');
    const [tokenErrorMsg, setTokenErrorMsg] = useState<string | undefined>(undefined);
    const [chat, setChat] = useState<TgChatDTO | undefined>(undefined);

    useEffect(() => {
        if (!topLvlChat) return;
        setCurrentStep(finalStepIndex);
        setChat(topLvlChat);
    }, [topLvlChat]);

    const next = async () => {
        if (currentStep === savingStepIndex) {
            await bindTelegram();
        } else {
            setTokenErrorMsg(undefined);
            setCurrentStep(currentStep + 1);
        }
    };

    const prev = () => {
        setTokenErrorMsg(undefined);
        if (currentStep === 0 || chat) {
            previousCallback();
            return;
        }
        setCurrentStep(currentStep - 1);
    };

    const onCodeChange = (token: string) => {
        setCode(token);
        setTokenErrorMsg(!isCodeValid(token) ? 'Please enter token!' : undefined);

    }

    const isCodeValid = (token: string): boolean => {
        return token !== undefined && token !== null && token.trim().length !== 0;
    }

    const bindTelegram = async () => {
        if (!isCodeValid(code)) {
            setTokenErrorMsg('Please enter token!');
            return;
        }

        try {
            setIsLoading(true);
            const bindRes = await Api.integration.bindTelegram(subscriptionId, code);
            if (bindRes.error?.message !== undefined) {
                setTokenErrorMsg(bindRes.error!!.message);
                return;
            }
            setChat(await Api.integration.getChat(subscriptionId));
            setCurrentStep(currentStep + 1);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Component
     */
    const generateDescriptions = (descriptionItems: ReactNode[], child: ReactNode | undefined = undefined) => {
        return (
            <div className={styles.integrationStepWrapper}>
                <div className={styles.integrationStepContentWrapper}>
                    <div className={styles.integrationStepDescriptionWrapper}>
                        <ul>
                            {descriptionItems.map((child, index) => {
                                return (
                                    <>
                                        {index !== 0 ? <br/> : <></>}
                                        <li>{child}</li>
                                    </>
                                );
                            })}
                        </ul>
                    </div>
                    {child && child}
                </div>
            </div>
        );
    }

    const getTgBotLink = (): ReactNode => {
        return (
            <Link
                href={`https://t.me/${TgBotName}`}
                className={styles.integrationLink}
                target={'_blank'}
            >
                @{TgBotName}
            </Link>
        );
    }

    const firstStep = () => {
        return (
            <>
                <div className={styles.integrationStepWrapper}>
                    <Select
                        placeholder={'Add hosting platform'}
                        defaultValue={Platform.Telegram.toString()}
                        style={{width: '100%'}}
                        onChange={value => setPlatform(value)}
                    >
                        <Select.Option key={Platform.Telegram.toString()}
                                       value={Platform.Telegram.toString()}>{Platform.Telegram.toString()}</Select.Option>
                    </Select>
                </div>
                {
                    generateDescriptions(
                        [
                            <p key={'tg-instruction-step-one-1'}>
                                To link your Telegram chat to the subscription, click on {getTgBotLink()}.
                            </p>,
                            <p key={'tg-instruction-step-one-2'}>
                                Press the "Start" button on the bot's page.
                            </p>,
                            <p key={'tg-instruction-step-one-3'}>
                                Invite {getTgBotLink()} to your private chat. To do this, go to the chat's information
                                panel and find the "Members" tab.
                            </p>,
                            <p key={'tg-instruction-step-one-4'}>
                                Click on the "Add member" button and find {getTgBotLink()} in the list of available
                                bots. Click on it to add it to the channel.
                            </p>,
                            <p key={'tg-instruction-step-one-5'}>
                                Make {getTgBotLink()} an administrator of your chat. To do this, go to the chat's
                                information panel and click “Edit” bottom.
                            </p>,
                            <p key={'tg-instruction-step-one-6'}>
                                Select “Administrators” option, click “Add Admin” and tap on {getTgBotLink()} to select
                                it as an administrator.
                            </p>,
                        ])
                }
            </>
        );
    }

    const secondStep = () => {
        return (
            <>
                {
                    generateDescriptions(
                        [
                            <p key={'tg-instruction-step-two-1'}>
                                Write a message "@nodde_bot bind" in your private chat. The bot should respond with a
                                private message containing a code.
                            </p>,
                            <p key={'tg-instruction-step-two-2'}>
                                Copy the code received from {getTgBotLink()}.
                            </p>,

                            <p key={'tg-instruction-step-two-3'}>
                                Enter the copied code in the "Telegram Token" field below.
                            </p>,
                        ])
                }
                <div className={styles.integrationStepWrapper}>
                    <Input
                        disabled={isLoading}
                        style={{width: '100%', height: 64, paddingLeft: 20, borderColor: tokenErrorMsg ? 'red' : ''}}
                        value={code}
                        placeholder="Enter telegram code"
                        onChange={v => onCodeChange(v.target.value)}
                    />
                    {tokenErrorMsg &&
                        <div style={{color: "red", fontSize: '12px', marginTop: '12px'}}>{tokenErrorMsg}</div>}
                </div>
            </>
        );
    }

    const thirdStep = () => {
        return (
            <>
                {chat &&
                    <>
                        <h3>Telegram integration completed!</h3>
                        <Link href={chat!!.chat!!.link} target={'_blank'} style={{margin: '32px 0'}}>
                            <CustomButton
                                type={"small"}
                                style={{padding: '0 32px', backgroundColor: '#d9d9d9'}}
                                onClick={() => {
                                }}>
                                Open '{chat!!.chat!!.title}'
                            </CustomButton>
                        </Link>
                    </>
                }
            </>
        );
    }

    const steps: ReactNode[] = [
        firstStep(),
        secondStep(),
        thirdStep(),
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    fontSize: 24,
                    fontFamily: 'co-headline',
                    controlHeight: 64,
                    colorBorder: '#000',
                    borderRadius: 14,
                    colorPrimaryHover: '#000',
                    colorPrimaryActive: '#fff'
                }
            }}
        >
            <div className={styles.integrationFlowWrapper}>
                {steps[currentStep]}
                <div className={styles.eventButtonWrapper}>
                    <CustomButton
                        type={"small"}
                        color={"gray"}
                        disabled={isLoading}
                        style={{marginRight: '20px'}}
                        onClick={prev}
                    >
                        Back
                    </CustomButton>

                    {currentStep < steps.length - 1 && (
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={next}>
                            Next
                        </CustomButton>
                    )}
                    {currentStep === steps.length - 1 && (
                        <CustomButton
                            type={"small"}
                            color={"green"}
                            disabled={isLoading}
                            onClick={doneCallback}>
                            Done
                        </CustomButton>
                    )}
                </div>
            </div>
        </ConfigProvider>
    );
}

export default Integration;
