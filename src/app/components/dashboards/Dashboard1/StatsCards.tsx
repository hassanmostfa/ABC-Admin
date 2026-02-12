"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useGetStatisticsQuery } from "@/store/api/statisticsApi";
import { Spinner } from "flowbite-react";

const StatsCards = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetStatisticsQuery();
  const stats = data?.data;

  const statsData = [
    {
      title: t("dashboard.stats.numberOfUsers"),
      value: stats?.customers_count ?? "—",
      icon: "solar:users-group-two-rounded-outline",
      bgColor: "bg-lightprimary",
      textColor: "text-primary",
    },
    {
      title: t("dashboard.stats.numberOfCharities"),
      value: stats?.charities_count ?? "—",
      icon: "solar:buildings-2-line-duotone",
      bgColor: "bg-lightsecondary",
      textColor: "text-secondary",
    },
    {
      title: t("dashboard.stats.numberOfProducts"),
      value: stats?.products_count ?? "—",
      icon: "solar:cart-line-duotone",
      bgColor: "bg-lighterror",
      textColor: "text-error",
    },
    {
      title: t("dashboard.stats.numberOfOffers"),
      value: stats?.offers_count ?? "—",
      icon: "solar:gift-line-duotone",
      bgColor: "bg-lightwarning",
      textColor: "text-warning",
    },
    {
      title: t("dashboard.stats.numberOfCategories"),
      value: stats?.categories_count ?? "—",
      icon: "solar:tag-line-duotone",
      bgColor: "bg-lightsuccess",
      textColor: "text-success",
    },
    {
      title: t("dashboard.stats.numberOfOrders"),
      value: stats?.orders?.total ?? "—",
      icon: "solar:clipboard-list-line-duotone",
      bgColor: "bg-lightinfo",
      textColor: "text-info",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardBox key={i} className="text-center flex flex-col items-center justify-center min-h-[180px]">
            <Spinner size="lg" />
          </CardBox>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statsData.map((stat, index) => (
        <CardBox key={index} className="text-center">
          <div className={`h-16 w-16 mx-auto mb-4 flex items-center justify-center rounded-full ${stat.bgColor}`}>
            <Icon
              icon={stat.icon}
              className={`${stat.textColor}`}
              height={32}
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">{stat.value}</h3>
          <p className="text-sm text-gray-600">{stat.title}</p>
        </CardBox>
      ))}
    </div>
  );
};

export default StatsCards;
