"use client";

import React, { useState } from "react";
import {
  Card,
  Badge,
  Spinner,
  Label,
  Select,
  Pagination,
  Button,
  TextInput,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useGetPaymentsQuery } from "@/store/api/paymentsApi";
import { useTranslation } from "react-i18next";
import type { Payment } from "@/store/api/paymentsApi";

const PaymentsPage = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useGetPaymentsQuery({
    page: currentPage,
    per_page: 15,
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { type: typeFilter }),
    ...(methodFilter && { method: methodFilter }),
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return "—";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "KWD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { color: "success" | "failure" | "warning" | "info"; labelKey: string }
    > = {
      pending: { color: "warning", labelKey: "payments.status.pending" },
      completed: { color: "success", labelKey: "payments.status.completed" },
      failed: { color: "failure", labelKey: "payments.status.failed" },
      refunded: { color: "info", labelKey: "payments.status.refunded" },
    };
    const c = config[status] || { color: "info" as const, labelKey: "" };
    const label = c.labelKey ? t(c.labelKey) : status;
    return (
      <Badge color={c.color} className="w-fit">
        {label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const keys: Record<string, string> = {
      order: "payments.type.order",
      wallet_charge: "payments.type.walletCharge",
    };
    return t(keys[type] || type);
  };

  const getMethodLabel = (method: string) => {
    const keys: Record<string, string> = {
      online: "payments.method.online",
      cash: "payments.method.cash",
      wallet: "payments.method.wallet",
      card: "payments.method.card",
    };
    return t(keys[method] || method);
  };

  const getCustomerDisplay = (payment: Payment) => {
    if (payment.customer) {
      return { name: payment.customer.name, phone: payment.customer.phone };
    }
    const order = payment.invoice?.order;
    const customer = order?.customer;
    if (customer) {
      return { name: customer.name, phone: customer.phone };
    }
    return null;
  };

  const getOrderLink = (payment: Payment) => {
    const orderId = payment.invoice?.order?.id;
    if (orderId) return `/orders/show/${orderId}`;
    return null;
  };

  // Client-side search by payment_number or reference
  const filteredData = React.useMemo(() => {
    let list = data?.data ?? [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.payment_number?.toLowerCase().includes(q) ||
          (p.reference && p.reference.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.data, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-lighterror dark:bg-darkerror border-r-4 border-error rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
              <Icon icon="solar:danger-circle-bold" height={24} className="text-error" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">{t("payments.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("payments.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  const pagination = data?.pagination;
  const showPagination = pagination && pagination.last_page > 1 && !searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("payments.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("payments.subtitle")}</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <div className="min-w-[200px]">
            <Label className="mb-2 block">{t("payments.search")}</Label>
            <TextInput
              placeholder={t("payments.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={() => <Icon icon="solar:magnifer-bold" height={18} />}
            />
          </div>
          <div className="min-w-[140px]">
            <Label className="mb-2 block">{t("payments.status")}</Label>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("payments.allStatuses")}</option>
              <option value="pending">{t("payments.status.pending")}</option>
              <option value="completed">{t("payments.status.completed")}</option>
              <option value="failed">{t("payments.status.failed")}</option>
            </Select>
          </div>
          <div className="min-w-[140px]">
            <Label className="mb-2 block">{t("payments.type")}</Label>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("payments.allTypes")}</option>
              <option value="order">{t("payments.type.order")}</option>
              <option value="wallet_charge">{t("payments.type.walletCharge")}</option>
            </Select>
          </div>
          <div className="min-w-[140px]">
            <Label className="mb-2 block">{t("payments.method")}</Label>
            <Select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("payments.allMethods")}</option>
              <option value="online">{t("payments.method.online")}</option>
              <option value="cash">{t("payments.method.cash")}</option>
              <option value="wallet">{t("payments.method.wallet")}</option>
              <option value="card">{t("payments.method.card")}</option>
            </Select>
          </div>
          <Button
            color="gray"
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("");
              setMethodFilter("");
              setSearchQuery("");
              setCurrentPage(1);
            }}
          >
            {t("payments.reset")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.paymentNumber")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.type")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.customer")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.amount")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.bonusAmount")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.totalAmount")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.method")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.status")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.paidAt")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("payments.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((payment, index) => {
                const customer = getCustomerDisplay(payment);
                const orderLink = getOrderLink(payment);
                return (
                  <tr
                    key={payment.id}
                    className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-dark dark:text-white">
                      {pagination && !searchQuery.trim() ? pagination.from + index : index + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-dark dark:text-white">
                      {payment.payment_number}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-white">
                      {getTypeLabel(payment.type)}
                    </td>
                    <td className="px-4 py-3">
                      {customer ? (
                        <div>
                          <div className="font-medium text-dark dark:text-white">{customer.name}</div>
                          <div className="text-xs text-ld dark:text-white/70">{customer.phone}</div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dark dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-ld dark:text-white/70">
                      {payment.bonus_amount ? formatCurrency(payment.bonus_amount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-white">
                      {formatCurrency(payment.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-white">
                      {getMethodLabel(payment.method)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                    <td className="px-4 py-3 text-ld dark:text-white/70 whitespace-nowrap">
                      {formatDate(payment.paid_at)}
                    </td>
                    <td className="px-4 py-3">
                      {orderLink ? (
                        <Link href={orderLink}>
                          <button
                            className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                            title={t("payments.viewOrder")}
                          >
                            <Icon icon="solar:eye-bold" height={16} className="text-primary" />
                          </button>
                        </Link>
                      ) : (
                        <span className="text-ld dark:text-white/70 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:wallet-money-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("payments.noPayments")}</p>
            </div>
          )}
        </div>

        {showPagination && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("payments.showing", {
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
              previousLabel={t("payments.previous")}
              nextLabel={t("payments.next")}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentsPage;
