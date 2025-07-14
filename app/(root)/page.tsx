import { auth, signOut } from "@/auth";
import Title from "@/components/home/Title";

const Page = async () => {
  // const session = await auth();

  // console.log("session", session);
  return (
    <div className="px-24">
      <Title />
    </div>
  );
};

export default Page;
