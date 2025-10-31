'use client'
import React from 'react';
import Image from "next/image";
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href={'/'}>
      <Image src={'/images/logos/logo-icon.svg'} alt="logo" />
    </Link>
  );
}
