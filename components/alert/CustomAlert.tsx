import React from "react";
import { useState, useEffect } from "react";
import styles from "@/styles/CustomAlert.module.css";

interface CustomAlertProps {
  text?: string;
  key?: string | number;
  type?: "none" | "success" | "warning" | "error";
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  text = "",
  key = undefined,
  type = "none",
  style = {},
  children,
  onClose,
}) => {
  const [animate, setAnimate] = useState(false);
  setTimeout(() => setAnimate(false), 500);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const icon =
    type === "success"
      ? ` ${styles.icon_success}`
      : type === "warning"
      ? ` ${styles.icon_warning}`
      : type === "error"
      ? ` ${styles.icon_error}`
      : undefined;

  return (
    <>
      {
        <div className={styles.alert_background} onClick={handleClick}>
          <div
            className={styles.alert_animate}
          ><div
            className={styles.container + (animate ? ` ${styles.animate}` : "")}
          >
            <div className={styles.parent_alert}>
              <div className={styles.alert} key={key} style={style}>
                {icon && <div className={styles.icon + icon} />}
                {text.length > 0 && <p>{text}</p>}
                {children}
              </div>
              <button className={styles.close_button} onClick={handleClose}>
                &times;
              </button>
            </div>
          </div>
        </div>
        </div>
      }
    </>
  );
};

export default CustomAlert;
