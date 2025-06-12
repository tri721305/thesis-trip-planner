import React from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FaHamburger } from "react-icons/fa";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/route";
import NavLinks from "./NavLinks";
import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";

const MobileNavigation = async () => {
  const session = await auth();

  const userId = session?.user?.id;
  console.log("session Mobile Nav", session);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <HamburgerMenuIcon
          width={36}
          height={36}
          className="lg:hidden cursor-pointer"
        />
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="background-light900_dark200 border-none"
      >
        <SheetTitle className="hidden">Navigation</SheetTitle>
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/images/site-logo.svg"
            width={23}
            height={23}
            alt="logo"
          />
          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 ">
            Trip<span className="text-primary-500">Planner</span>
          </p>
        </Link>
        <div className="no-scrollbar flex h-[calc(100vh-160px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-6 pt-16">
              <NavLinks userId={userId} isMobileNav />
            </section>
          </SheetClose>
        </div>
        <div className="flex flex-col gap-3">
          {userId ? (
            <SheetClose>
              <form
                action={async () => {
                  "use server";

                  await signOut();
                }}
              >
                <Button
                  type="submit"
                  className="base-medium w-fit !bg-transparent px-4 py-3"
                >
                  <LogOut className="size-5 text-black dark:text-white" />
                  <span className="text-dark300_light900 ">Logout</span>
                </Button>
              </form>
            </SheetClose>
          ) : (
            <>
              <SheetClose asChild>
                <Link href={ROUTES.SIGN_IN}>
                  <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                    <span className="primary-text-gradient">Log In</span>
                  </Button>
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link href={ROUTES.SIGN_UP}>
                  <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
                    Sign Up
                  </Button>
                </Link>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
