import Image from "next/image";
import Link from "next/link";
import React from "react";

import GlobalSearch from "@/components/search/GlobalSearch";

import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";
import NavLinks from "./NavLinks";
import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";

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

      <div className="flex-between gap-5">
        <Theme />
        {session?.user?.id && (
          <UserAvatar
            id={session.user.name!}
            name={session.user.name!}
            imageUrl={session.user.image!}
          />
        )}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
