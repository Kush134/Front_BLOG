import styles from "@/styles/Profile.module.css";
import Image from "next/image";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Input, Modal} from "antd";
import React, {useState} from "react";
import youtubeIcon from "@/assets/social_media_logo/youtube.svg";
import githubIcon from "@/assets/social_media_logo/github.svg";
import telegramIcon from "@/assets/social_media_logo/telegram.svg";
import twitterIcon from "@/assets/social_media_logo/twitter.svg";
import externalIcon from "@/assets/social_media_logo/external_link.svg";
import instagramIcon from "@/assets/social_media_logo/instagram.svg";
import facebookIcon from "@/assets/social_media_logo/facebook.svg";
import vkIcon from "@/assets/social_media_logo/vk.svg";
import discordIcon from "@/assets/social_media_logo/discord.svg";

const SOCIAL_MEDIA_LINK_SIZE = 6;

interface Props {
  socialMediaLinks: string[];
  setSocialLinks?: (links: string[]) => void;
  editing: boolean;
  hasError: boolean | undefined;
}

const SocialMediaList: React.FC<Props> = ({
  socialMediaLinks,
  setSocialLinks,
  editing = false,
  hasError = false,
}) => {
  const [addSocialLinkMenu, setAddSocialLinkMenu] = useState(false);

  const [editedLinkItemId, setEditedLinkItemId] = useState<number | undefined>(
    undefined
  );
  const [newSocialMediaLink, setNewSocialMediaLink] = useState("");

  const showAddSocialLinkMenu = () => setAddSocialLinkMenu(true);

  const addNewSocialLink = () => {
    if (!newSocialMediaLink || newSocialMediaLink.length == 0) {
      console.error("Please fill all fields.");
      return;
    }

    let newLink = toSocialMediaLink(newSocialMediaLink);
    if (editedLinkItemId !== undefined) {
      console.log(`editing ${editedLinkItemId}`);
      setSocialLinks!!([
        ...socialMediaLinks.map((item, index) => {
          if (index === editedLinkItemId) {
            return newLink;
          } else {
            return item;
          }
        }),
      ]);
    } else {
      const json = JSON.stringify(newLink);
      const hasLink =
        socialMediaLinks.filter((item) => JSON.stringify(item) == json).length >
        0;
      if (!hasLink) {
        setSocialLinks!!([...socialMediaLinks, newLink]);
      }
    }

    resetToDefaultValue();
  };

  const cancelNewSocialLink = () => {
    resetToDefaultValue();
  };

  const deleteButtonHandler = (indexForDelete: number) => {
    setSocialLinks!!(
      [...socialMediaLinks].filter((item, index) => index != indexForDelete)
    );
  };

  const showEditSocialLinkMenu = (index: number, link: string) => {
    setEditedLinkItemId(index);
    setNewSocialMediaLink(link);
    setAddSocialLinkMenu(true);
  };

  const resetToDefaultValue = () => {
    setEditedLinkItemId(undefined);
    setAddSocialLinkMenu(false);
    setNewSocialMediaLink("");
  };

  return (
    <div className={styles.socialMediaLinksContainer}>
      {socialMediaLinks.map((item, index) => (
        <div className={`${styles.cardSize} ${styles.card}`} key={index}>
          <a
            href={editing ? "#" : item}
            target={editing ? "" : "_blank"}
            rel="noopener noreferrer"
            onClick={
              editing ? () => showEditSocialLinkMenu(index, item) : () => {}
            }
          >
            <Image
              className={styles.cardImage}
              src={staticImageByType(getTypeByUrl(item))}
              alt={`Link logo`}
              fill
            />
          </a>
          {editing && (
            <div
              className={styles.cardDeleteButton}
              onClick={() => deleteButtonHandler(index)}
            >
              <DeleteOutlined style={{ fontSize: "10px" }} />
            </div>
          )}
        </div>
      ))}
      {socialMediaLinks.length <= SOCIAL_MEDIA_LINK_SIZE && editing && (
        <>
          {Array(SOCIAL_MEDIA_LINK_SIZE - socialMediaLinks.length)
            .fill(0)
            .map((zero, index) => (
              <button
                key={`social-media-link-index-${socialMediaLinks.length + index}`}
                className={`${styles.cardSize} ${styles.addCardButton} ${
                  hasError ? styles.addCardButtonErrorBg : styles.addCardButtonBg
                }`}
                onClick={() => { if (index === 0) showAddSocialLinkMenu() }}
              >
                {index === 0 && (
                  <>
                    <PlusOutlined />
                    <p style={{ paddingTop: "8px" }}>Add link</p>
                  </>
                )}
              </button>
            ))}
          <Modal
            title="Add social media link"
            centered
            open={addSocialLinkMenu}
            onOk={addNewSocialLink}
            onCancel={cancelNewSocialLink}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Input
                value={newSocialMediaLink}
                placeholder="Social media link"
                onChange={(e) => setNewSocialMediaLink(e.target.value)}
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default SocialMediaList;

export enum SocialMediaType {
  YouTube = "YouTube",
  Github = "Github",
  Telegram = "Telegram",
  Twitter = "Twitter",
  Instagram = "Instagram",
  Facebook = "Facebook",
  Vk = "Vk",
  Discord = "Discord",
  Link = "Link",
}

const baseUrlReg = /((http|https):\/\/)(.*)/;
export const toSocialMediaLink = (url: string): string => {
  if (!baseUrlReg.test(url)) {
    url = `https://${url}`;
  }
  return url;
};

const getTypeByUrl = (url: string): SocialMediaType => {
  let it = urlValidatorByTypeMap.entries();
  let entry = it.next();
  while (!entry.done) {
    const type = entry.value[0];
    const regExp = entry.value[1];
    if (regExp.test(url.toLocaleLowerCase())) return type;
    entry = it.next();
  }
  return SocialMediaType.Link;
};

const staticImageByType = (type: SocialMediaType) => {
  switch (type) {
    case SocialMediaType.YouTube:
      return youtubeIcon;
    case SocialMediaType.Github:
      return githubIcon;
    case SocialMediaType.Telegram:
      return telegramIcon;
    case SocialMediaType.Twitter:
      return twitterIcon;
    case SocialMediaType.Instagram:
      return instagramIcon;
    case SocialMediaType.Facebook:
      return facebookIcon;
    case SocialMediaType.Vk:
      return vkIcon;
    case SocialMediaType.Discord:
      return discordIcon;
    case SocialMediaType.Link:
    default:
      return externalIcon;
  }
};

// todo think about this filters
const defaultRegExp = /(.*)/;
const urlValidatorByTypeMap: Map<SocialMediaType, RegExp> = new Map([
  [SocialMediaType.YouTube, /((http|https):\/\/)?(www\.)?youtube\.com\/(.*)/],
  [SocialMediaType.Github, /((http|https):\/\/)?(www\.)?github\.com\/(.*)/],
  [SocialMediaType.Telegram, /((http|https):\/\/)?(www\.)?t\.me\/(.*)/],
  [SocialMediaType.Twitter, /((http|https):\/\/)?(www\.)?twitter\.com\/(.*)/],
  [
    SocialMediaType.Instagram,
    /((http|https):\/\/)?(www\.)?instagram\.com\/(.*)/,
  ],
  [SocialMediaType.Facebook, /((http|https):\/\/)?(www\.)?facebook\.com\/(.*)/],
  [SocialMediaType.Vk, /((http|https):\/\/)?(www\.)?vk\.com\/(.*)/],
  [
    SocialMediaType.Discord,
    /((http|https):\/\/)?(www\.)?discord\.(gg|com)\/(.*)/,
  ],
  [SocialMediaType.Link, defaultRegExp],
]);

const urlValidatorByType = (type: SocialMediaType): RegExp => {
  const regExp = urlValidatorByTypeMap.get(type);
  if (regExp) return regExp;
  return defaultRegExp;
};
