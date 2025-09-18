import { auth, signOut } from "@/auth";
import AnimatedSlider from "@/components/banner/AnimatedSlider";
import GSAPSlider from "@/components/banner/GSAPSlider";
import About from "@/components/home/About";
import Destination from "@/components/home/Destination";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import HeaderHomePage from "@/components/home/HeaderHomePage";
import MyGuideAndPlan from "@/components/home/MyGuideAndPlan";

import Recently from "@/components/home/Recently";
import SearchHotelBar from "@/components/home/SearchHotelBar";
import Title from "@/components/home/Title";
import TripPlan from "@/components/home/TripPlan";
import SearchBar from "@/components/search/SearchBar";

const Page = async () => {
  const session = await auth();

  console.log("session Page layout", session);
  if (session?.user) {
    return (
      <div className="">
        <Recently />
        <SearchHotelBar />
        <MyGuideAndPlan />
      </div>
    );
  }
  return (
    <div className="">
      <GSAPSlider />
      <About />
      <Features />
      <TripPlan />
      <Destination />
      <Footer />
    </div>
  );
};

export default Page;
