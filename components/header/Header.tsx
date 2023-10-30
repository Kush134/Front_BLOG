import styles from "@/styles/Header.module.css";
import WalletButton from "@/components/wallet/WalletButton";
import React, { ReactNode, Ref } from "react";

export default function Header({
  showLogo = true,
  profileId = undefined,
  base64Logo = undefined,
  children = undefined,
}: {
  showLogo?: boolean;
  profileId?: string;
  base64Logo?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.header_description}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {showLogo && (
            <a href={"/"}>
              <div
                style={{ width: "179px", height: "35px" }}
                className={styles.logo_nodde}
              ></div>
            </a>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
          <WalletButton profileId={profileId} base64Logo={base64Logo} />
        </div>
      </div>
    </div>
  );
}
