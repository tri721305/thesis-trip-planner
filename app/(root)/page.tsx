import { auth, signOut } from "@/auth";
import AnimatedSlider from "@/components/banner/AnimatedSlider";
import GSAPSlider from "@/components/banner/GSAPSlider";
import HeaderHomePage from "@/components/home/HeaderHomePage";
import Title from "@/components/home/Title";

const Page = async () => {
  // const session = await auth();

  return (
    <div className="">
      {/* <HeaderHomePage /> */}
      <GSAPSlider />
      {/* <Title /> */}
    </div>
  );
};

export default Page;
