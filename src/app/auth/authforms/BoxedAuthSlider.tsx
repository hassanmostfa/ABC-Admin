"use client";
import { Carousel } from "flowbite-react";
import Image from "next/image";
import React from "react";
import AuthSlide from "/images/backgrounds/login-side.png";
import { Button } from "flowbite-react";
import { usePathname } from "next/navigation";

const BoxedAuthSlider = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="max-w-md mx-auto h-full flex flex-col justify-center items-center boxed-auth">
        <Image
          src={AuthSlide}
          alt="auth"
          className={`${
            pathname == "/auth/auth2/forgot-password" ||
            pathname == "/auth/auth2/two-steps"
              ? "max-w-[200px]"
              : "max-w-[300px]"
          }`}
        />

        <h1 className="text-4xl md:text-5xl font-bold mt-8 text-center dark:text-white">مرحبا بعودتك</h1>

      </div>
    </>
  );
};

export default BoxedAuthSlider;
