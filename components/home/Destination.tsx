import React from "react";

const Destination = () => {
  return (
    <div className="w-screen  py-10 px-20 flex justify-start gap-4 flex-col items-center">
      <h1 className="font-montserrat font-bold  uppercase text-3xl text-center mb-16">
        Explore hundreds of places to visit for every corner of the world
      </h1>
      <div className="flex w-full px-24 items-center gap-4">
        <div
          style={{
            backgroundImage: "url('/images/hcmcity.jpg')",
            height: "400px",
            // width: "360px",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 cursor-pointer flex justify-start items-end rounded-lg overflow-hidden relative"
        >
          {/* Overlay để làm tối background */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

          <div className="p-4 relative z-10">
            <h1 className="font-extrabold font-montserrat text-white text-[2rem]">
              Hồ Chí Minh City
            </h1>
            <h2 className="font-semibold text-white text-[0.8rem]">
              Bến Thành market - Bitexco - Landmark 81
            </h2>
          </div>
        </div>
        <div
          style={{
            backgroundImage: "url('/images/hanoi.jpg')",
            height: "400px",
            // width: "360px",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 cursor-pointer flex justify-start items-end rounded-lg overflow-hidden relative"
        >
          {/* Overlay để làm tối background */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

          <div className="p-4 relative z-10">
            <h1 className="font-extrabold font-montserrat text-white text-[2rem]">
              Hà Nội
            </h1>
            <h2 className="font-semibold text-white text-[0.8rem]">
              Bến Thành market - Bitexco - Landmark 81
            </h2>
          </div>
        </div>
        <div
          style={{
            backgroundImage: "url('/images/danang.jpg')",
            height: "400px",
            // width: "360px",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 cursor-pointer flex justify-start items-end rounded-lg overflow-hidden relative"
        >
          {/* Overlay để làm tối background */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

          <div className="p-4 relative z-10">
            <h1 className="font-extrabold font-montserrat text-white text-[2rem]">
              Đà Nẵng
            </h1>
            <h2 className="font-semibold text-white text-[0.8rem]">
              Bến Thành market - Bitexco - Landmark 81
            </h2>
          </div>
        </div>
      </div>
      <div className="flex gap-4 w-full px-24 items-center justify-between ">
        <div
          style={{
            backgroundImage: "url('/images/hcmcity.jpg')",
            height: "400px",
            width: "360px",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex cursor-pointer justify-start items-end rounded-lg overflow-hidden relative"
        >
          {/* Overlay để làm tối background */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

          <div className="p-4 relative z-10">
            <h1 className="font-extrabold font-montserrat text-white text-[2rem]">
              Đà Lạt
            </h1>
            <h2 className="font-semibold text-white text-[0.8rem]">
              Bến Thành market - Bitexco - Landmark 81
            </h2>
          </div>
        </div>
        <div
          style={{
            backgroundImage: "url('/images/hcmcity.jpg')",
            height: "400px",
            // width: "720px",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="flex-1 cursor-pointer flex justify-start items-end rounded-lg overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          <div className="p-4 relative z-10">
            <h1 className="font-extrabold font-montserrat text-white text-[2rem]">
              Đà Lạt
            </h1>
            <h2 className="font-semibold text-white text-[0.8rem]">
              Bến Thành market - Bitexco - Landmark 81
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destination;
