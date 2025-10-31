"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
const FullLogo = () => {
  return (
    <Link href={"/"}>
      <Image src={'/images/logos/logo.svg'} alt="logo" className="block w-32 h-auto" />
    </Link>
  );
};

export default FullLogo;
