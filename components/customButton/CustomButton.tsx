import React, { ReactNode, Ref } from "react";
import styles from "@/styles/Button.module.css";

type ButtonType = "med" | "small" | "wide";
type ButtonColor = "green" | "gray" | "white";

interface ButtonProps {
  key?: any;
  value?: any;
  onClick: (() => void) | ((e: any) => void) | undefined;
  type?: ButtonType;
  color?: ButtonColor;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: ReactNode;
  ref?: Ref<any> | undefined;
}

const CustomButton: React.FC<ButtonProps> = ({
  onClick,
  key = undefined,
  value = undefined,
  type = "med",
  color = "green",
  disabled = false,
  style = {},
  children,
  ref,
}) => {
  const className = `${styles.button} ${
    color === "green" ? styles.green : color === "gray" ? styles.gray : styles.white
  } ${
    type === "med" ? styles.med : type === "small" ? styles.small : styles.wide
  }
  ${disabled && styles.disabled}`;

  return (
    <button
      ref={ref}
      className={className}
      key={key}
      value={value}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default CustomButton;
