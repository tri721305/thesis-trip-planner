import { auth, signOut } from "@/auth";
import Title from "@/components/home/Title";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/route";

const Page = async () => {
  return (
    <div className="">
      <form
        className="px-10 pt-[100px]"
        action={async () => {
          "use server";
          await signOut({ redirectTo: ROUTES.SIGN_IN });
        }}
      >
        <Button type="submit">Log out</Button>
      </form>
      <Title />
    </div>
  );
};

export default Page;
