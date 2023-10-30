import React from "react";
import CustomButton from "@/components/customButton/CustomButton";
import Image from "next/image";
import EditSvg from "@/assets/svg_icon/edit_square.svg";

export default function EditeProfileButton({
  saveCallback = undefined,
  edited = false,
  setEdited = undefined,
  disabled,
}: {
  saveCallback: Function | undefined;
  edited: boolean;
  setEdited: Function | undefined;
  disabled: boolean;
}) {
  const onEditHandle = () => {
    setEdited!!(true);
  };

  const onSaveHandle = () => {
    if (!saveCallback) {
      console.log("Save callback is undefined");
      return;
    }
    console.log("Saving result");
    saveCallback();
  };

  return (
    <CustomButton
      style={{
        minWidth: "56px",
        height: "56px",
        padding: "0 16px ",
        margin: "0 12px",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      type="small"
      color={"gray"}
      disabled={disabled}
      onClick={edited ? onSaveHandle : onEditHandle}
    >
      {edited ? (
        "Save"
      ) : (
        <Image src={EditSvg} alt={"Edit icon"} width={20} height={20} />
      )}
    </CustomButton>
  );
}
