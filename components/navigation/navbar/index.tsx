import Image from "next/image";
import Link from "next/link";
import React from "react";

import GlobalSearch from "@/components/search/GlobalSearch";

import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";
import NavLinks from "./NavLinks";
import { auth, signOut } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import CurrentUserAvatar from "@/components/CurrentUserAvatar";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/route";
import { IoMdLogOut } from "react-icons/io";
import InvitationIndicator from "@/components/invitations/InvitationIndicator";

const Navbar = async () => {
  const session = await auth();
  return (
    <nav className="flex-between flex background-light900_dark200 fixed z-50 w-full gap-5 p-2 h-[80px] shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={23}
          height={23}
          alt="DevFlow Logo"
        />

        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Trip<span className="text-primary-500">Planner</span>
        </p>
      </Link>

      <section className="flex px-4 background-light900_dark200 light-border  flex-1  shadow-light-300 dark:shadow-none max-lg:hidden">
        <NavLinks isMobileNav={false} />
      </section>

      <GlobalSearch />
      {!session?.user?.id && (
        <div className="flex gap-2 items-center">
          {/* <Button className="bg-primary-500 text-white shadow-md font-bold">
            {" "}
            Sign In
          </Button> */}
          <Button
            className="small-medium bg-primary-500 hover:bg-primary-500 shadow-md text-white min-h-[41px] w-full rounded-lg px-4 py-3"
            asChild
          >
            <Link href={ROUTES.SIGN_IN}>
              <Image
                src="/icons/account.svg"
                alt="Account"
                width={20}
                height={20}
                className="invert-colors lg:hidden"
              />
              <span className="text-white text-[14px] font-bold max-lg:hidden">
                Sign In
              </span>
            </Link>
          </Button>
          <Button
            variant={"outline"}
            className="border border-primary-500 hover:bg-white !text-primary-500 border-none shadow-md font-bold"
          >
            Sign Up
          </Button>
        </div>
      )}
      <div className="flex-between gap-5">
        <Theme />
        {session?.user?.id && (
          <>
            <InvitationIndicator className="mr-1" />
            {/* Use CurrentUserAvatar to fetch latest user data */}
            <div className="flex" suppressHydrationWarning>
              <UserAvatar
                id={session.user.id!}
                name={session.user.name!}
                imageUrl={session.user.image!}
              />
              {/* 
              <!-- Uncomment this and comment out the UserAvatar above to use the dynamic avatar -->
              <CurrentUserAvatar
                userId={session.user.id!}
                sessionName={session.user.name!}
                sessionImageUrl={session.user.image!}
              />
              */}
            </div>
          </>
        )}
        {session?.user?.id && (
          <Button
            onClick={async () => {
              "use server";

              await signOut();
            }}
            className="h-[40px] font-bold"
          >
            Logout <IoMdLogOut />
          </Button>
        )}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
