"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Select, Badge, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "@/store/api/ordersApi";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";
import Link from "next/link";

const OrdersPage = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [updateOrderStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  const { data: ordersData, isLoading, error } = useGetOrdersQuery({
    search: searchTerm || undefined,
    page: currentPage,
    status: statusFilter || undefined,
    payment_method: paymentMethodFilter || undefined,
    delivery_type: deliveryTypeFilter || undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: "success" | "failure" | "warning" | "info"; label: string }> = {
      pending: { color: "warning", label: t("orders.status.pending") },
      processing: { color: "info", label: t("orders.status.processing") },
      completed: { color: "success", label: t("orders.status.completed") },
      cancelled: { color: "failure", label: t("orders.status.cancelled") },
    };

    const config = statusConfig[status] || { color: "info", label: status };
    return (
      <Badge color={config.color} className="w-fit">
        {config.label}
      </Badge>
    );
  };


  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: t("orders.paymentMethod.cash"),
      wallet: t("orders.paymentMethod.wallet"),
      card: t("orders.paymentMethod.card"),
    };
    return methods[method] || method;
  };

  const getDeliveryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      pickup: t("orders.deliveryType.pickup"),
      delivery: t("orders.deliveryType.delivery"),
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      showNotification("success", t("orders.success"), t("orders.statusUpdated"));
    } catch (err: any) {
      showNotification("error", t("orders.error"), err?.data?.message || t("orders.updateError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{t("orders.loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("orders.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("orders.subtitle")}</p>
        </div>
        {/* <Link href="/orders/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Icon icon="solar:add-circle-bold" height={20} />
            {t("orders.addNew")}
          </button>
        </Link> */}
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Label htmlFor="search" className="mb-2 block">{t("orders.search")}</Label>
              <TextInput
                id="search"
                placeholder={t("orders.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={() => <Icon icon="solar:magnifer-bold" height={18} />}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="mb-2 block">{t("orders.status")}</Label>
              <Select
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="select-md"
              >
                <option value="">{t("orders.allStatuses")}</option>
                <option value="pending">{t("orders.status.pending")}</option>
                <option value="processing">{t("orders.status.processing")}</option>
                <option value="completed">{t("orders.status.completed")}</option>
                <option value="cancelled">{t("orders.status.cancelled")}</option>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <Label htmlFor="payment" className="mb-2 block">{t("orders.paymentMethod")}</Label>
              <Select
                id="payment"
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="select-md"
              >
                <option value="">{t("orders.allPaymentMethods")}</option>
                <option value="cash">{t("orders.paymentMethod.cash")}</option>
                <option value="wallet">{t("orders.paymentMethod.wallet")}</option>
              </Select>
            </div>

            {/* Delivery Type Filter */}
            <div>
              <Label htmlFor="delivery" className="mb-2 block">{t("orders.deliveryType")}</Label>
              <Select
                id="delivery"
                value={deliveryTypeFilter}
                onChange={(e) => {
                  setDeliveryTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="select-md"
              >
                <option value="">{t("orders.allDeliveryTypes")}</option>
                <option value="pickup">{t("orders.deliveryType.pickup")}</option>
                <option value="delivery">{t("orders.deliveryType.delivery")}</option>
              </Select>
            </div>
          </div>

          {/* Date Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From */}
            <div>
              <Label htmlFor="dateFrom" className="mb-2 block">{t("orders.dateFrom")}</Label>
              <TextInput
                id="dateFrom"
                type="date"
                placeholder={t("orders.dateFromPlaceholder")}
                value={dateFromFilter}
                onChange={(e) => {
                  setDateFromFilter(e.target.value);
                  setCurrentPage(1);
                }}
                icon={() => <Icon icon="solar:calendar-bold" height={18} />}
              />
            </div>

            {/* Date To */}
            <div>
              <Label htmlFor="dateTo" className="mb-2 block">{t("orders.dateTo")}</Label>
              <TextInput
                id="dateTo"
                type="date"
                placeholder={t("orders.dateToPlaceholder")}
                value={dateToFilter}
                onChange={(e) => {
                  setDateToFilter(e.target.value);
                  setCurrentPage(1);
                }}
                icon={() => <Icon icon="solar:calendar-bold" height={18} />}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPaymentMethodFilter("");
                setDeliveryTypeFilter("");
                setDateFromFilter("");
                setDateToFilter("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
            >
              {t("orders.reset")}
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.orderNumber")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.customer")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.paymentMethod")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.deliveryType")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.totalAmount")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("orders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {ordersData?.data?.map((order, index) => (
                <tr key={order.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 text-dark dark:text-white font-medium">
                    {ordersData.pagination ? (ordersData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium text-dark dark:text-white">
                      {order.order_number}
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ width: "180px" }}>
                    <div>
                      {order.type === "customer" && order.customer ? (
                        <>
                          <div className="font-medium text-dark dark:text-white">{order.customer.name}</div>
                          <div className="text-sm text-ld dark:text-white/70">{order.customer.phone}</div>
                        </>
                      ) : order.type === "charity" && order.charity ? (
                        <>
                          <div className="font-medium text-dark dark:text-white">{order.charity.name_ar}</div>
                          <div className="text-sm text-ld dark:text-white/70">{order.charity.phone}</div>
                        </>
                      ) : (
                        <span className="text-ld dark:text-white/70">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {getPaymentMethodLabel(order.payment_method)}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {getDeliveryTypeLabel(order.delivery_type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-dark dark:text-white">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ld dark:text-white/70">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/orders/show/${order.id}`}>
                      <button className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                        <Icon icon="solar:eye-bold" height={16} className="text-primary" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {(!ordersData?.data || ordersData.data.length === 0) && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-ld dark:text-white/70">
                    {t("orders.noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ordersData?.pagination && ordersData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("orders.showing", { 
                from: ordersData.pagination.from, 
                to: ordersData.pagination.to, 
                total: ordersData.pagination.total 
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={ordersData.pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("orders.previous")}
              nextLabel={t("orders.next")}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrdersPage;

