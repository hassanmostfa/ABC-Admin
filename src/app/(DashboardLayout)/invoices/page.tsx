"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Select, Badge, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetInvoicesQuery, useUpdateInvoiceStatusMutation } from "@/store/api/invoicesApi";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";

const InvoicesPage = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [updateInvoiceStatus, { isLoading: updating }] = useUpdateInvoiceStatusMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [orderIdFilter, setOrderIdFilter] = useState<string>("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  const { data: invoicesData, isLoading, error } = useGetInvoicesQuery({
    search: searchTerm || undefined,
    page: currentPage,
    status: statusFilter || undefined,
    order_id: orderIdFilter ? parseInt(orderIdFilter) : undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: "success" | "failure" | "warning" | "info" | "purple"; label: string }> = {
      pending: { color: "warning", label: t("invoices.status.pending") },
      paid: { color: "success", label: t("invoices.status.paid") },
      cancelled: { color: "failure", label: t("invoices.status.cancelled") },
      refunded: { color: "purple", label: t("invoices.status.refunded") },
    };

    const config = statusConfig[status] || { color: "info", label: status };
    return (
      <Badge color={config.color} className="w-fit">
        {config.label}
      </Badge>
    );
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
      minimumFractionDigits: 3,
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("");
    setOrderIdFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
  };

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await updateInvoiceStatus({ id: invoiceId, status: "paid" }).unwrap();
      showNotification("success", t("invoices.success"), t("invoices.statusUpdated"));
    } catch (err: any) {
      showNotification("error", t("invoices.error"), err?.data?.message || t("invoices.updateError"));
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
        <p className="text-error">{t("invoices.loadError")}</p>
      </div>
    );
  }

  const invoices = invoicesData?.data || [];
  const pagination = invoicesData?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("invoices.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("invoices.subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Label htmlFor="search" className="mb-2 block">{t("invoices.search")}</Label>
              <TextInput
                id="search"
                placeholder={t("invoices.searchPlaceholder")}
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
              <Label htmlFor="status" className="mb-2 block">{t("invoices.status")}</Label>
              <Select
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="select-md"
              >
                <option value="">{t("invoices.allStatuses")}</option>
                <option value="pending">{t("invoices.status.pending")}</option>
                <option value="paid">{t("invoices.status.paid")}</option>
                <option value="cancelled">{t("invoices.status.cancelled")}</option>
                <option value="refunded">{t("invoices.status.refunded")}</option>
              </Select>
            </div>

            {/* Order ID Filter */}
            <div>
              <Label htmlFor="order_id" className="mb-2 block">{t("invoices.orderId")}</Label>
              <TextInput
                id="order_id"
                type="number"
                placeholder={t("invoices.orderIdPlaceholder")}
                value={orderIdFilter}
                onChange={(e) => {
                  setOrderIdFilter(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Date Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date From */}
            <div>
              <Label htmlFor="date_from" className="mb-2 block">{t("invoices.dateFrom")}</Label>
              <TextInput
                id="date_from"
                type="date"
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
              <Label htmlFor="date_to" className="mb-2 block">{t("invoices.dateTo")}</Label>
              <TextInput
                id="date_to"
                type="date"
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
              onClick={handleReset}
              className="px-4 py-2 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
            >
              {t("invoices.reset")}
            </button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.invoiceNumber")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.orderNumber")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.customer")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.amountDue")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.paidAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("invoices.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => {
                const customerName = invoice.order.customer 
                  ? invoice.order.customer.name 
                  : invoice.order.charity 
                  ? (i18n.language === "ar" ? invoice.order.charity.name_ar : invoice.order.charity.name_en)
                  : "-";
                
                const customerPhone = invoice.order.customer 
                  ? invoice.order.customer.phone 
                  : invoice.order.charity 
                  ? invoice.order.charity.phone
                  : null;
                
                return (
                  <tr key={invoice.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                    <td className="px-6 py-4 text-dark dark:text-white font-medium">
                      {pagination ? (pagination.from + index) : (index + 1)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/invoices/show/${invoice.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/orders/show/${invoice.order_id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                        {invoice.order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4" style={{ width: "180px" }}>
                      <div>
                        {customerName !== "-" ? (
                          <>
                            <div className="font-medium text-dark dark:text-white">{customerName}</div>
                            {customerPhone && (
                              <div className="text-sm text-ld dark:text-white/70">{customerPhone}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-ld dark:text-white/70">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-dark dark:text-white">
                        {formatCurrency(invoice.amount_due)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ld dark:text-white/70">
                      {formatDateTime(invoice.paid_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-ld dark:text-white/70">
                      {formatDate(invoice.created_at)}
                    </td>
                    <td className="px-6 py-4 flex justify-center items-center text-center">
                      {invoice.status === "pending" ? (
                        <button
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          disabled={updating}
                          style={{ width: "130px" }}
                          className="h-8 px-3 rounded-lg bg-success text-center text-white hover:bg-success/90 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon icon="solar:check-circle-bold" height={16} />
                          {t("invoices.markAsPaid")}
                        </button>
                      ) : (
                        getStatusBadge(invoice.status)
                      )}
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-ld dark:text-white/70">
                    {t("invoices.noInvoices")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("invoices.showing", {
                from: pagination.from,
                to: pagination.to,
                total: pagination.total,
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("invoices.previous")}
              nextLabel={t("invoices.next")}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoicesPage;

