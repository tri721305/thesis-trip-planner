import { Phone } from "lucide-react";
import React from "react";
import { MdEmail } from "react-icons/md";

const traveler = [
  "Hotels",
  "Blog",
  "Report security",
  "Terms, Privacy policy & Copyright",
  "Travel budgeting & cost tracking",
  "How to embed a map on your travel blog",
];
const resources = [
  "Trip planners by destination",
  "Explore cities and countries",
  "Road trips by destination",
  "Best places to visit by category",
  "Popular search terms by destination",
  "Weather around the world",
  "Travel questions & answers",
  "Travel itinerary guides",
  "Maps of cities and national parks",
  "Places to visit by destination",
];
const Footer = () => {
  return (
    <div className="h-screen w-screen bg-[#f3f4f5] flex justify-center py-20 overflow-hidden gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-[20px]">Traveler</h1>
        {traveler.map((item) => (
          <p className="text-gray-700" key={item}>
            {item}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-[20px]"> Guide and Resources</h1>
        {resources.map((item) => (
          <p className="text-gray-700" key={item}>
            {item}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-[20px]">Contact</h1>
        Made with ❤️ in Ho Chi Minh City, Việt Nam
        <div className="flex gap-2 items-center">
          <MdEmail size={20} />
          <p>dhmt721305@gmail.com</p>
        </div>
        <div className="flex gap-2 items-center">
          <Phone size={20} />
          <p>0869712597</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
