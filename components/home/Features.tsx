import Image from "next/image";
import React from "react";

const Features = () => {
  const featureList = [
    {
      name: "Add places from guides with one click",
      description:
        "We crawled the web so you don’t have to. Easily add mentioned places to your plan.",
      imageName: "feature1",
    },
    {
      name: "Expense tracking and splitting",
      description:
        "Keep track of your budget and split the cost between your tripmates.",
      imageName: "feature2",
    },
    {
      name: "Import hotel reservations",
      description:
        "Connect or forward your emails to get it magically added into your trip plan.",
      imageName: "feature3",
    },
    {
      name: "Collaborate with friends in real time",
      description:
        "Plan along with your friends with live syncing and collaborative editing.",
      imageName: "feature4",
    },
    {
      name: "Checklists for everything",
      description:
        "Stay organized with a packing list, to-do list, shopping list, any kind of list",
      imageName: "feature5",
    },
    {
      name: "Get personalized recommendations",
      description:
        "Find the best places to visit with smart recommendations based on your itinerary.",
      imageName: "feature6",
    },
  ];

  return (
    <div className="py-10 px-20">
      <h1 className="font-montserrat font-bold  uppercase text-5xl text-center mb-16">
        Features
      </h1>
      {/* <p className="text-2xl text-gray-500">Replace all your other tools</p> */}
      <div className="grid grid-rows-2 grid-cols-3 gap-8 px-40 place-items-center">
        {featureList.map((feature: any, i: number) => (
          <div
            key={feature.name + i}
            className="flex flex-col gap-2 justify-start items-center text-center"
          >
            <img
              className="border-gray-200 border-2 rounded-lg w-[300px]"
              src={`images/${feature.imageName}.png`}
            />
            <p className="font-bold text-[18px]">{feature.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
