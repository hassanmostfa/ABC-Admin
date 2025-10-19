"use client";
import { Icon } from "@iconify/react";
import { Badge, Dropdown, DropdownItem } from "flowbite-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useLogoutMutation } from "@/store/api/authApi";
import { selectCurrentAdmin } from "@/store/selectors/authSelectors";

const profileDD = [
  {
    title: "الملف الشخصي",
    url: "/apps/user-profile/profile"
  }
];

const Profile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectCurrentAdmin);
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear Redux state and localStorage regardless of API response
      dispatch(logout());
      router.push("/auth/auth2/login");
    }
  };

  return (
    <div className="relative ">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] pb-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-1">
            <span className="h-10 w-10 hover:text-primary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
              <Image
                src="/images/profile/user-1.jpg"
                alt="logo"
                height="35"
                width="35"
                className="rounded-full"
              />
            </span>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className="hover:text-primary dark:text-primary group-hover/menu:text-primary"
              height={12}
            />
          </div>
        )}
      >
        <div className="px-6">
          <div className="flex items-center gap-6 pb-5 border-b border-border dark:border-darkborder mt-5 mb-3">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height="56"
              width="56"
              className="rounded-full"
            />
            <div>
              <h5 className="text-15 font-semibold">
                {admin?.name || "مستخدم"}
              </h5>
              <p className="text-sm text-ld opacity-80">{admin?.email || ""}</p>
            </div>
          </div>
        </div>
        <SimpleBar>
          {profileDD.map((items, index) => (
            <div key={index} className="px-6 mb-2">
              {/* <DropdownItem
                as={Link}
                href={items.url}
                className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md"
              >
                <div className="flex items-center w-full ">
                  <div className=" flex gap-3 w-full ">
                    <h5 className="text-15 font-normal group-hover/link:text-primary">
                      {items.title}
                    </h5>
                  </div>
                </div>
              </DropdownItem> */}
            </div>
          ))}
          
          {/* Logout Button */}
          <div className="px-6 mb-2">
            <DropdownItem
              onClick={handleLogout}
              className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md cursor-pointer"
            >
              <div className="flex items-center w-full ">
                <div className=" flex gap-3 w-full ">
                  <h5 className="text-15 font-normal group-hover/link:text-primary">
                    تسجيل الخروج
                  </h5>
                </div>
              </div>
            </DropdownItem>
          </div>
        </SimpleBar>
      </Dropdown>
    </div>
  );
};

export default Profile;
