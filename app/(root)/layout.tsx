import { ReactNode } from "react";

import Navbar from "@/components/navigation/navbar";
import LeftSidebar from "@/components/navigation/LeftSidebar";

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="background-light850_dark100 realtive">
      <Navbar />

      <div className="flex">
        {/* <LeftSidebar /> */}

        <section className="flex min-h-screen flex-1 flex-col px-4 pb-6 pt-32 max-md:pb-0 sm:px-0">
          {/* <div className="mx-auto w-full max-w-5xl">{children}</div> */}
          <div>{children}</div>
        </section>

        {/* <RightSidebar /> */}
      </div>
    </main>
  );
};

export default RootLayout;
