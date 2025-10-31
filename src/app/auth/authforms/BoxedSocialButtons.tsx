"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { HR, HRText } from "flowbite-react";

interface MyAppProps {
    title?:string;
  }

const BoxedSocialButtons: React.FC<MyAppProps> = ({ title }) => {
  return (
    <>
      <div className="flex justify-between gap-8 mb-6 md:mt-10 mt-5">
        
        <Link
          href={"/"}
          className="px-4 py-3 shadow-tw border border-ld flex gap-2 items-enter w-full rounded-md text-center justify-center text-ld hover:bg-sky hover:text-white dark:text-white dark:hover:bg-sky font-semibold"
        >
          <Image src={'/images/svgs/facebook-icon.svg'} alt="google" height={18} width={18} />
         <span className="lg:flex hidden">Sign in with</span>Facebook
        </Link>
        <Link
          href={"/"}
          className="px-4 py-3 shadow-tw border border-ld flex gap-2 items-enter w-full rounded-md text-center justify-center text-ld hover:bg-sky hover:text-white dark:text-white dark:hover:bg-sky font-semibold"
        >
          <Image src={'/images/svgs/google-icon.svg '} alt="google" height={18} width={18} /> <span className="lg:flex hidden">Sign in with</span>Google
        </Link>
      </div>
      {/* Divider */}
      <HRText text={`${title}`} className="border-t! border-ld! bg-transparent! text-bodytext" />
    </>
  );
};

export default BoxedSocialButtons;
