import { auth, signOut } from "@/auth";
import Title from "@/components/home/Title";
import { Button } from "@/components/ui/button";

import ROUTES from "@/constants/route";
import { importData } from "@/lib/actions/importdata.action";

const Page = async () => {
  return (
    <div className="">
      <Title />
    </div>
  );
};

export default Page;
