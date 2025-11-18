"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const ChartData: any = {
  series: [20, 20, 20, 20],
  labels: ["245", "45", "14", "78"],
  chart: {
    height: 230,
    fontFamily: "inherit",
    type: "donut",
  },
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 90,
      offsetY: 10,
      donut: {
        size: "90%",
      },
    },
  },
  grid: {
    padding: {
      bottom: -80,
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
    name: {
      show: false,
    },
  },
  stroke: {
    width: 2,
    colors: "var(--color-surface-ld)",
  },
  tooltip: {
    fillSeriesColor: false,
  },
  colors: [
    "var(--color-error)",
    "var(--color-warning)",
    "var(--color-lightwarning)",
    "var(--color-lightsecondary)",
  ],
};

const YourPerformance = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <CardBox>
        <div>
          <h5 className="card-title">{t("dashboard.performance.title")}</h5>
          <p className="card-subtitle">{t("dashboard.performance.lastCheck")}</p>
        </div>
        <div className="grid grid-cols-12 mt-6">
          <div className="md:col-span-6 col-span-12">
            <div className="grid grid-cols-2 gap-4">
              {/* First Row */}
              <div className="flex gap-3 items-center">
                <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                  <Icon
                    icon="solar:shop-2-linear"
                    className="text-primary"
                    height={20}
                  />
                </span>
                <div>
                  <h5 className="text-13 font-semibold">64</h5>
                  <p className="text-xs text-gray-600">{t("dashboard.performance.processing")}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lighterror rounded-tw">
                  <Icon
                    icon="solar:filters-outline"
                    className="text-error"
                    height={20}
                  />
                </span>
                <div>
                  <h5 className="text-13 font-semibold">4</h5>
                  <p className="text-xs text-gray-600">{t("dashboard.performance.onHold")}</p>
                </div>
              </div>
              
              {/* Second Row */}
              <div className="flex gap-3 items-center">
                <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightsecondary rounded-tw">
                  <Icon
                    icon="solar:pills-3-linear"
                    className="text-secondary"
                    height={20}
                  />
                </span>
                <div>
                  <h5 className="text-13 font-semibold">12</h5>
                  <p className="text-xs text-gray-600">{t("dashboard.performance.delivered")}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightwarning rounded-tw">
                  <Icon
                    icon="solar:check-circle-linear"
                    className="text-warning"
                    height={20}
                  />
                </span>
                <div>
                  <h5 className="text-13 font-semibold">8</h5>
                  <p className="text-xs text-gray-600">{t("dashboard.performance.completed")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 col-span-12 md:-mt-8 mt-4">
            <Chart
              options={ChartData}
              series={ChartData.series}
              type="donut"
              height="230px"
              width="100%"
            />
            <h4 className="text-center text-3xl md:mt-3">88</h4>
            <p className="text-sm text-center mt-3">
              {t("dashboard.performance.description")}
            </p>
          </div>
        </div>
      </CardBox>
    </>
  );
};

export default YourPerformance;
