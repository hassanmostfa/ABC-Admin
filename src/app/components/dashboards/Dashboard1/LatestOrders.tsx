"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useGetStatisticsQuery } from "@/store/api/statisticsApi";
import type { StatisticsLatestOrder } from "@/store/api/statisticsApi";
import { Spinner } from "flowbite-react";

const getStatusConfig = (status: string) => {
  const config: Record<string, { labelKey: string; className: string }> = {
    pending: { labelKey: "dashboard.orders.status.pending", className: "bg-lightwarning text-warning" },
    processing: { labelKey: "dashboard.orders.status.processing", className: "bg-lightprimary text-primary" },
    delivered: { labelKey: "dashboard.orders.status.delivered", className: "bg-lightsecondary text-secondary" },
    completed: { labelKey: "dashboard.orders.status.completed", className: "bg-lightsuccess text-success" },
    cancelled: { labelKey: "dashboard.orders.status.cancelled", className: "bg-lighterror text-error" },
    onHold: { labelKey: "dashboard.orders.status.onHold", className: "bg-lighterror text-error" },
  };
  return config[status] || { labelKey: status, className: "bg-gray-100 text-gray-700" };
};

const LatestOrders = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetStatisticsQuery();
  const orders = data?.data?.latest_orders ?? [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => `${amount} ${t("dashboard.currency")}`;

  const getProductDisplay = (order: StatisticsLatestOrder) => {
    if (order.items?.length) {
      const names = order.items.map((i) => i.name).filter(Boolean);
      return names.length > 1 ? `${names[0]} +${names.length - 1}` : names[0] || "—";
    }
    return "—";
  };

  if (isLoading) {
    return (
      <CardBox>
        <h5 className="card-title mb-6">{t("dashboard.orders.latestOrders")}</h5>
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      </CardBox>
    );
  }

  return (
    <CardBox>
      <div className="flex justify-between items-center mb-6">
        <h5 className="card-title">{t("dashboard.orders.latestOrders")}</h5>
        <Link href="/orders" className="text-primary hover:text-primary-dark text-sm font-medium">
          {t("dashboard.orders.viewAll")}
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.orderNumber")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.customer")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.product")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.amount")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.status")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t("dashboard.orders.date")}</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  {t("dashboard.orders.noOrders")}
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{order.order_number}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{order.customer?.name ?? "—"}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{getProductDisplay(order)}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">
                      {order.invoice != null
                        ? formatAmount(order.invoice.amount_due)
                        : formatAmount(order.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        {t(statusConfig.labelKey)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</td>
                    <td className="py-3 px-4">
                      <Link href={`/orders/show/${order.id}`} className="text-primary hover:underline text-sm">
                        {t("dashboard.orders.view")}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CardBox>
  );
};

export default LatestOrders;
