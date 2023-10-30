import React from "react";
import ImageUploader from "@/components/imageUploader/ImageUploader";
import styles from "@/styles/Profile.module.css";

interface Props {
  isLoading: boolean;
  base64LogoUrl?: string;
  setBase64Logo: ((base64Img: string | undefined) => void) | undefined;
  editing: boolean;
  hasError: boolean | undefined;
}

const Logo: React.FC<Props> = ({
  isLoading,
  base64LogoUrl,
  setBase64Logo = undefined,
  editing = false,
  hasError = false,
}) => {
  return (
    <div
      className={styles.logoProfile}
      style={{
        gridArea: "logo",
        cursor: editing ? "pointer" : "auto",
      }}
    >
      <ImageUploader
        disabled={isLoading}
        description={"Add you avatar"}
        sizeText={"350 x 350 px"}
        hasError={hasError}
        editing={editing}
        base64Img={base64LogoUrl}
        setBase64Img={setBase64Logo}
      />
    </div>
  );
};

export default Logo;
