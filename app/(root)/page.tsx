import { auth, signOut } from "@/auth";
import AnimatedSlider from "@/components/banner/AnimatedSlider";
import GSAPSlider from "@/components/banner/GSAPSlider";
import About from "@/components/home/About";
import Destination from "@/components/home/Destination";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import HeaderHomePage from "@/components/home/HeaderHomePage";
import Title from "@/components/home/Title";
import TripPlan from "@/components/home/TripPlan";

const Page = async () => {
  // const session = await auth();

  return (
    <div className="">
      {/* <HeaderHomePage /> */}
      <GSAPSlider />
      {/* <Title /> */}
      <About />
      <Features />
      <TripPlan />
      <Destination />
      <Footer />
    </div>
  );
};

export default Page;
