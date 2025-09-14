import React from "react";

const About = () => {
  return (
    <div className="w-screen h-screen py-10 px-20 flex flex-col justify-between items-center">
      <h1 className="font-montserrat font-bold  uppercase text-5xl text-center mb-16">
        About
      </h1>
      <div className="flex justify-around items-center gap-4 h-[30%] w-[80%]">
        <div
          style={{
            backgroundImage: "url('/images/cat-ba.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full"
        >
          T
        </div>
        <div
          style={{
            backgroundImage: "url('/images/caobang.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[6rem]"
        >
          R
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[12rem]"
        >
          A
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[18rem]"
        >
          V
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[18rem]"
        >
          E
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[12rem]"
        >
          L
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full mt-[6rem]"
        >
          E
        </div>
        <div
          style={{
            backgroundImage: "url('/images/ocean.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 text-[6rem] font-extrabold opacity-90 text-white flex-center shadow-md rounded-lg h-full h-full"
        >
          R
        </div>
      </div>
      <div className="mt-16 w-[60%] text-center">
        Our comprehensive trip planning platform empowers travelers to create
        detailed, personalized itineraries with ease. Whether you're planning a
        weekend getaway, a business trip, or the adventure of a lifetime, our
        tools help you organize every aspect of your journey from start to
        finish.
      </div>
    </div>
  );
};

export default About;
