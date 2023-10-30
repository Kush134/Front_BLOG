import styles from "@/styles/Profile.module.css";
import Logo from "@/components/logo/Logo";
import SocialMediaList from "@/components/social_media_list/SocialMediaList";
import Donate from "@/components/donate/donate";
import SubscriptionList from "@/components/subscription/SubscriptionList";
import Statistics from "@/components/statistics/Statistics";
import React, {useState} from "react";
import {BaseProfile} from "@/pages/profile/[profileId]";
import {BriefSubscriptionInfo} from "@/api/dto/subscription.dto";
import {buildProfileImageLink} from "@/utils/s3";

interface Props {
  baseData: BaseProfile;
  tokens: string[];
  subscriptions: BriefSubscriptionInfo[];
  isOwner: boolean;
}

const Profile: React.FC<Props> = ({
  baseData,
  tokens,
  subscriptions,
  isOwner,
}) => {
  const getAvailableSubscriptions = () => {
    return subscriptions.filter((s) => isOwner || s.status === "PUBLISHED");
  };

  const [showStatistics, setShowStatistics] = useState(false);

  const handleMouseEnter = () => {
    setShowStatistics(true);
  };

  const handleMouseLeave = () => {
    setShowStatistics(false);
  };

  return (
    <div className={styles.gridWrapper}>
      <div className={styles.grid}>
        <div
          className={styles.container}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`${styles.embeddedComponent} ${
              showStatistics && styles.showComponent
            }`}
          >
            <Statistics profileId={baseData.id} />
          </div>
          <Logo
            isLoading={false}
            base64LogoUrl={buildProfileImageLink(baseData.logoId!!)}
            setBase64Logo={undefined}
            editing={false}
            hasError={false}
          />
          <div className={styles.icon}>i</div>
        </div>
        <div
          className={styles.profileDescription}
          style={{ gridArea: "description" }}
        >
          <h1>{baseData.title}</h1>
          <div
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              textAlign: "justify",
            }}
          >
            {/* Todo use markdown here, but not now */}
            <p className={styles.lineBreak}>{baseData.description}</p>
          </div>
          <SocialMediaList
            socialMediaLinks={baseData.socialMediaLinks}
            setSocialLinks={undefined}
            editing={false}
            hasError={false}
          />
        </div>
      </div>
      <Donate
        profileId={baseData.id}
        availableTokens={tokens}
        isOwner={isOwner}
      />
      {
          (isOwner || getAvailableSubscriptions().length > 0) &&
          <SubscriptionList
              profileId={baseData.id}
              subscriptions={getAvailableSubscriptions()}
              isOwner={isOwner}
          />
      }
    </div>
  );
};

export default Profile;
