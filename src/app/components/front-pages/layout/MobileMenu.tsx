"use client";
import React, { useState } from "react";
import { Button, Drawer, DrawerItems } from "flowbite-react";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import Navigation from "./Navigation";
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <div className="xl:hidden flex">
        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center text-dark  h-10 w-10 rounded-full bg-transparent hover:bg-lightprimary"
        >
          <IconMenu2 className="shrink-0" />
        </Button>
      </div>
      <Drawer open={isOpen} onClose={handleClose} className="h-full">
        <DrawerItems className="p-6">
          <div className="mb-6">
            <FullLogo />
          </div>
          <Navigation />
          <Button
            as={Link}
            href="/auth/auth2/login"
            className="font-bold w-full mt-6"
            color={"sky"}
          >
            Log in
          </Button>
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default MobileMenu;
