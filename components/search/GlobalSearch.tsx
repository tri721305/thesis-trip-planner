import { FaSearch } from "react-icons/fa";

import { Input } from "../ui/input";

const GlobalSearch = () => {
  return (
    <div className="relative w-full max-w-[300px] max-lg:hidden">
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <FaSearch className="cursor-pointer" />
        <Input
          type="text"
          placeholder="Search anything globally..."
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
      </div>
    </div>
  );
};

export default GlobalSearch;
