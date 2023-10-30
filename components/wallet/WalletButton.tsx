import {ConnectButton, useAccountModal} from '@rainbow-me/rainbowkit';
import Image from "next/image";
import React, {ReactNode, useEffect, useRef, useState} from "react";
import heroIcon from "@/assets/Hero.png";
import {MenuOutlined} from "@ant-design/icons";
import {Dropdown, MenuProps} from "antd";
import {useRouter} from "next/router";
import CustomButton from "@/components/customButton/CustomButton";
import ReactMarkdown from "react-markdown";


interface Props {
    profileId?: string;
    base64Logo?: string;
    children?: ReactNode;
}

const WalletButton: React.FC<Props> = ({profileId, base64Logo, children}) => {

    const router = useRouter();
    const {openAccountModal} = useAccountModal();

    const [isOpen, setIsOpen] = useState(false);
    const openCloseMenu = () => setIsOpen(p => !p);

    const wrapperRef = useRef(null);

    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: any) {
            // @ts-ignore
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const items: MenuProps['items'] = [
        {
            key: 'profile-menu-1',
            // disabled: !profileId,
            label: (
                <div
                    style={{fontSize: '14px', fontFamily: 'co-headline', padding: '10px'}}
                    onClick={() => {
                        if (!profileId) {
                            router.push("/");
                        } else {
                            router.push(`/profile/${profileId!!}`);
                        }
                    }}
                >
                    {profileId ? ("Profile") : ("Main")}
                </div>
            ),
        },
        {
            key: 'profile-menu-2',
            label: (
                <div
                    style={{fontSize: '14px', fontFamily: 'co-headline', padding: '10px'}}
                    onClick={openAccountModal}
                >
                    Wallet
                </div>
            ),
        },
    ];

    return (
        <ConnectButton.Custom>
            {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
              }) => {
                // Note: If your app doesn't use authentication, you
                // can remove all 'authenticationStatus' checks
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <ConnectButton/>
                                );
                            }
                            return (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    {children}
                                    <Dropdown
                                        menu={{items}}
                                        placement="bottomRight"
                                        arrow={false}
                                        open={isOpen}
                                        dropdownRender={body => <div ref={wrapperRef}>{body}</div>}
                                    >
                                        <CustomButton onClick={openCloseMenu} style={{
                                            backgroundColor: '#fff',
                                            height: '56px',
                                            minWidth: '100px',
                                            position: "relative",
                                            display: 'flex',
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: '8px'
                                        }}>
                                            <MenuOutlined style={{fontSize: '24px', marginRight: '8px'}}/>
                                            <Image
                                                width={40}
                                                height={40}
                                                style={{borderRadius: '50%'}}
                                                // todo fix it, use some default logo
                                                // src={base64Logo ? base64Logo : heroIcon}
                                                src={heroIcon}
                                                alt={`Profile logo`}
                                            />
                                        </CustomButton>
                                    </Dropdown>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    )
        ;
}

export default WalletButton;
