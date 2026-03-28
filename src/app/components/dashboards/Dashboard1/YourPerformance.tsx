"use client";
import React, { useMemo } from "react";
import CardBox from "../../shared/CardBox";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { useGetStatisticsQuery } from "@/store/api/statisticsApi";
import { DashboardSk } from "./DashboardSkeleton";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const YourPerformance = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetStatisticsQuery();
  const byStatus = data?.data?.orders?.by_status;

  const chartData = useMemo(() => {
    if (!byStatus) return null;
    const series = [
      byStatus.pending ?? 0,
      byStatus.processing ?? 0,
      byStatus.completed ?? 0,
      byStatus.cancelled ?? 0,
    ];
    const total = series.reduce((a, b) => a + b, 0);
    return {
      series,
      labels: [
        t("dashboard.performance.pending"),
        t("dashboard.performance.processing"),
        t("dashboard.performance.completed"),
        t("dashboard.performance.cancelled"),
      ],
      total,
      options: {
        chart: { height: 230, fontFamily: "inherit", type: "donut" as const },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 90,
            offsetY: 10,
            donut: { size: "90%" },
          },
        },
        grid: { padding: { bottom: -80 } },
        legend: { show: false },
        dataLabels: { enabled: false, name: { show: false } },
        stroke: { width: 2, colors: ["var(--color-surface-ld)"] },
        tooltip: { fillSeriesColor: false },
        colors: [
          "var(--color-warning)",
          "var(--color-info)",
          "var(--color-success)",
          "var(--color-error)",
        ],
      },
    };
  }, [byStatus, t]);

  if (isLoading) {
    return (
      <CardBox>
        <DashboardSk className="h-5 w-48 mb-2" />
        <DashboardSk className="h-3 w-64 max-w-full" />
        <div className="grid grid-cols-12 mt-6 gap-6">
          <div className="md:col-span-6 col-span-12 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <DashboardSk className="h-10 w-10 shrink-0 rounded-tw" />
                <div className="flex-1 space-y-2 min-w-0">
                  <DashboardSk className="h-4 w-12" />
                  <DashboardSk className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="md:col-span-6 col-span-12 flex flex-col items-center justify-center py-4">
            <DashboardSk className="h-[200px] w-[200px] max-w-full rounded-full" />
            <DashboardSk className="h-8 w-16 mt-4" />
            <DashboardSk className="h-3 w-48 mt-3 max-w-full" />
          </div>
        </div>
      </CardBox>
    );
  }

  if (!byStatus) {
    return (
      <CardBox>
        <h5 className="card-title">{t("dashboard.performance.title")}</h5>
        <p className="text-gray-500 mt-4">{t("dashboard.performance.noData")}</p>
      </CardBox>
    );
  }

  const pending = byStatus.pending ?? 0;
  const processing = byStatus.processing ?? 0;
  const completed = byStatus.completed ?? 0;
  const cancelled = byStatus.cancelled ?? 0;
  const total = pending + processing + completed + cancelled;

  return (
    <CardBox>
      <div>
        <h5 className="card-title">{t("dashboard.performance.title")}</h5>
        <p className="card-subtitle">{t("dashboard.performance.lastCheck")}</p>
      </div>
      <div className="grid grid-cols-12 mt-6">
        <div className="md:col-span-6 col-span-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-3 items-center">
              <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightwarning rounded-tw">
                <Icon icon="solar:clock-circle-linear" className="text-warning" height={20} />
              </span>
              <div>
                <h5 className="text-13 font-semibold">{pending}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("dashboard.performance.pending")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightprimary rounded-tw">
                <Icon icon="solar:shop-2-linear" className="text-primary" height={20} />
              </span>
              <div>
                <h5 className="text-13 font-semibold">{processing}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("dashboard.performance.processing")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lightsuccess rounded-tw">
                <Icon icon="solar:check-circle-linear" className="text-success" height={20} />
              </span>
              <div>
                <h5 className="text-13 font-semibold">{completed}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("dashboard.performance.completed")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="h-10 w-10 shrink-0 flex items-center justify-center bg-lighterror rounded-tw">
                <Icon icon="solar:close-circle-linear" className="text-error" height={20} />
              </span>
              <div>
                <h5 className="text-13 font-semibold">{cancelled}</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t("dashboard.performance.cancelled")}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-6 col-span-12 md:-mt-8 mt-4">
          {chartData && chartData.series.some((v) => v > 0) ? (
            <>
              <Chart
                options={chartData.options}
                series={chartData.series}
                type="donut"
                height="230px"
                width="100%"
              />
              <h4 className="text-center text-3xl md:mt-3">{total}</h4>
            </>
          ) : (
            <h4 className="text-center text-3xl py-12">0</h4>
          )}
          <p className="text-sm text-center mt-3">{t("dashboard.performance.description")}</p>
        </div>
      </div>
    </CardBox>
  );
};

export default YourPerformance;
