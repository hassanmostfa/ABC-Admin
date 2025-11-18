"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const StatsCards = () => {
  const { t } = useTranslation();
  
  const statsData = [
    {
      title: t("dashboard.stats.numberOfUsers"),
      value: "2,847",
      change: "+12.5%",
      icon: "solar:users-group-two-rounded-outline",
      bgColor: "bg-lightprimary",
      textColor: "text-primary",
      changeColor: "text-success"
    },
    {
      title: t("dashboard.stats.numberOfCharities"),
      value: "156",
      change: "+8.2%",
      icon: "solar:buildings-2-line-duotone",
      bgColor: "bg-lightsecondary",
      textColor: "text-secondary",
      changeColor: "text-success"
    },
    {
      title: t("dashboard.stats.numberOfProducts"),
      value: "3,429",
      change: "+15.3%",
      icon: "solar:cart-line-duotone",
      bgColor: "bg-lighterror",
      textColor: "text-error",
      changeColor: "text-success"
    },
    {
      title: t("dashboard.stats.numberOfOffers"),
      value: "89",
      change: "-2.1%",
      icon: "solar:gift-line-duotone",
      bgColor: "bg-lightwarning",
      textColor: "text-warning",
      changeColor: "text-error"
    },
    {
      title: t("dashboard.stats.numberOfCategories"),
      value: "24",
      change: "+5.7%",
      icon: "solar:tag-line-duotone",
      bgColor: "bg-lightsuccess",
      textColor: "text-success",
      changeColor: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
          <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
          <span className={`text-sm font-semibold ${stat.changeColor}`}>
            {stat.change}
          </span>
        </CardBox>
      ))}
    </div>
  );
};

export default StatsCards;
