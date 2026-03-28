"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Background from '/public/images/backgrounds/welcome-bg.png';
import { useTranslation } from "react-i18next";
import { useGetStatisticsQuery } from "@/store/api/statisticsApi";
import { DashboardSk } from "./DashboardSkeleton";

const WelcomeBox = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetStatisticsQuery();
  const stats = data?.data;

  const totalRevenue = stats?.total_revenue ?? 0;

  return (
    <>
      <CardBox className="bg-primary dark:bg-primary pb-0 h-full">
        <div className="grid grid-cols-12">
          <div className="md:col-span-7 col-span-12">
            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-tw bg-white flex items-center justify-center shrink-0 ">
                <Icon
                  icon="solar:course-up-outline"
                  className="text-dark opacity-70"
                  height={24}
                />
              </div>
              <h5 className="text-xl text-white">{t("dashboard.welcomeBack")}</h5>
            </div>
            {isLoading ? (
              <div className="mt-6 space-y-3 max-w-xs">
                <DashboardSk className="h-3 w-24 bg-white/25" />
                <DashboardSk className="h-8 w-40 bg-white/30" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 mt-6">
                <div>
                  <p className="text-white/75 text-sm mb-0.5">{t("dashboard.welcome.totalRevenue")}</p>
                  <p className="text-white text-xl font-semibold">{totalRevenue} {t("dashboard.currency")}</p>
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-5 col-span-12 md:ms-auto ms-auto me-auto">
          <Image
          src={Background}
          alt="background"
          className="-mb-n5 rtl:scale-x-[-1] xl:max-w-[170px] lg:max-w-36 md:max-w-36 max-w-32 lg:ps-4 md:pt-0 pt-6"
        />
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default WelcomeBox;
