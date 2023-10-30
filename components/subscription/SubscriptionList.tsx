import Image from "next/image";
import React from "react";
import {CheckOutlined, FormOutlined} from "@ant-design/icons";
import styles from "@/styles/Subscriptions.module.css";
import {BriefSubscriptionInfo} from "@/api/dto/subscription.dto";
import {useRouter} from "next/router";
import {buildSubscriptionImageLink} from "@/utils/s3";

const ROW_COUNT = 3;

interface Props {
  profileId: string;
  subscriptions: BriefSubscriptionInfo[];
  isOwner: boolean;
}

const SubscriptionList: React.FC<Props> = ({
  profileId,
  subscriptions,
  isOwner,
}) => {
  const router = useRouter();

  const getDrawSize = (): number => {
    const normalized = subscriptions.length % ROW_COUNT;
    if (normalized === 0) return ROW_COUNT;
    return ROW_COUNT - normalized;
  };

  return (
    <div className={styles.subscriptionsWrapper}>
      <h1 style={{ margin: "48px 0" }}>Subscriptions</h1>
      <div className={styles.subscriptionsContainer}>
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className={styles.subscriptionWrapper}>
            <Image
              src={buildSubscriptionImageLink(subscription.previewImageId!!)}
              alt={"Subscription logo"}
              className={styles.subscriptionImage}
              fill
              onClick={(e) =>
                router.push(
                  `/subscription/${subscription.id}`
                )
              }
            />
            <p className={`${styles.subscriptionTitle}`}>
              {subscription.title}
            </p>
            {isOwner && (
              <div
                className={`${styles.subscriptionStatus}`}
                onClick={(e) =>
                  router.push(
                    `/subscription/${subscription.id}?editing=true`
                  )
                }
              >
                {subscription.ownerId === profileId ? (
                  <FormOutlined style={{ fontSize: "20px" }} />
                ) : (
                  <CheckOutlined />
                )}
              </div>
            )}
          </div>
        ))}
        {Array(getDrawSize())
          .fill(1)
          .map((item, index) =>
            isOwner && index === 0 ? (
              <div
                key={`stub-${index}`}
                className={styles.createSubscriptionWrapper}
                onClick={() =>
                  router.push(`/subscription/create?profileId=${profileId}`)
                }
              >
                <div className={styles.createSubscriptionStub}>
                  <div className={styles.createSubscriptionIcon}></div>
                  <p>add new subscription</p>
                </div>
              </div>
            ) : (
              <div key={`stub-${index}`} className={styles.subscriptionWrapper}>
                <div className={styles.subscriptionStub}>
                  <p>Coming soon :</p>
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
};

export default SubscriptionList;
