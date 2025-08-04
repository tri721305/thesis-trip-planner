import React from "react";
import { Input } from "../ui/input";
interface InputIconProps {
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  disabled?: boolean;
  [key: string]: any; // Cho phép thêm bất kỳ props nào khác
}

const InputWithIcon = ({ icon, ...props }: InputIconProps) => {
  return (
    <div className="relative w-full ">
      <div
        className={`${props?.hover && "item-hover-btn"} ${props?.background ? "" : "background-form"}  focus:background-light800_darkgradient hover:background-light800_darkgradient relative flex min-h-[48px] grow items-center gap-1 rounded-md px-4 `}
      >
        <Input
          type="text"
          //   placeholder="Search anything globally..."
          className="paragraph-regular  no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
          {...props}
        />
        {icon}
      </div>
    </div>
  );
};

export default InputWithIcon;
