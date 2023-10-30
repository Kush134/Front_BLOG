import {message, Upload} from "antd";
import {DeleteOutlined, LoadingOutlined,} from "@ant-design/icons";
import React, {SyntheticEvent, useState} from "react";
import {RcFile} from "antd/es/upload";
import styles from "@/styles/Profile.module.css";
import Image from "next/image";
import ProfileAddSvg from "@/assets/svg_icon/person_add.svg";

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

interface Props {
  disabled: boolean;
  description: string;
  sizeText: string;
  hasError: boolean;
  editing: boolean;
  base64Img: string | undefined;
  setBase64Img: ((img: string | undefined) => void) | undefined;
}

const ImageUploader: React.FC<Props> = ({
  disabled,
  description,
  sizeText,
  hasError,
  editing,
  base64Img,
  setBase64Img,
}) => {
  const [isImgLoading, setIsImgLoading] = useState(false);

  const deleteButtonHandler = (e: SyntheticEvent<any>) =>
    setBase64Img!!(undefined);

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    // it's a workaround, replace to input with type data instead of `dragge`
    if (isJpgOrPng && isLt2M) {
      getBase64(file, (url) => {
        setIsImgLoading(false);
        setBase64Img!!(url);
      });
    }
    return false;
  };

  return (
    <>
      {base64Img && (
        <>
          <Image
            src={base64Img}
            alt={"Community logo"}
            style={{ borderRadius: "14px" }}
            fill
          />

          {editing && !disabled && (
            <div
              className={styles.logoDeleteButton}
              onClick={deleteButtonHandler}
            >
              <DeleteOutlined style={{ color: "red", fontSize: "20px" }} />
            </div>
          )}
        </>
      )}
      {!base64Img && (
        <Upload.Dragger
          disabled={disabled}
          maxCount={1}
          accept="image/*"
          beforeUpload={beforeUpload}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: "20px",
            border: "none",
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='20' ry='20' stroke='${hasError ? "red" : "%23837F7FFF"}' stroke-width='1' stroke-dasharray='10' stroke-dashoffset='0' stroke-linecap='round'/%3e%3c/svg%3e")`,
          }}
          className={`${styles.draggerWrapper}`}
        >

          <div>
            <div style={{margin: 0, height: '100%'}}>
              {isImgLoading ?
                  (<LoadingOutlined />) :
                  (<Image width={30} height={30} className={styles.personIcon} alt={'Add icon'} src={ProfileAddSvg}/>)
              }
            </div>
            <div style={{ fontSize: "16px", fontFamily: "co-headline" }}>
              {description}
            </div>
            <p
                style={{
                  paddingTop: "24px",
                  fontSize: "16px",
                  fontFamily: "co-headline",
                  color: "#837F7F",
                }}
            >
              {sizeText}
            </p>
          </div>
        </Upload.Dragger>
      )}
    </>
  );
};

export default ImageUploader;
