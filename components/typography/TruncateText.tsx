import React from "react";

const TruncateText = (props: any) => {
  console.log("props", props);
  const maxLength = props?.maxLength ? props.maxLength : 100;
  const displayText =
    props?.text.length > maxLength
      ? props?.text.substring(0, maxLength) + "..."
      : props?.text;
  return <p {...props}>{displayText}</p>;
};

export default TruncateText;
