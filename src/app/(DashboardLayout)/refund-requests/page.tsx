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
} from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import {
  useGetRefundRequestsQuery,
  useApproveRefundRequestMutation,
  useRejectRefundRequestMutation,
} from "@/store/api/refundRequestsApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTranslation } from "react-i18next";

const RefundRequestsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "reject";
    id: number;
    orderNumber: string;
    amount: number;
  } | null>(null);

  const { data, isLoading, error } = useGetRefundRequestsQuery({
    page: currentPage,
    per_page: 15,
    ...(statusFilter && { status: statusFilter }),
  });

  const [approveRequest, { isLoading: approving }] = useApproveRefundRequestMutation();
  const [rejectRequest, { isLoading: rejecting }] = useRejectRefundRequestMutation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
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
      pending: { color: "warning", labelKey: "refundRequests.status.pending" },
      approved: { color: "success", labelKey: "refundRequests.status.approved" },
      rejected: { color: "failure", labelKey: "refundRequests.status.rejected" },
    };
    const c = config[status] || { color: "info" as const, labelKey: "" };
    const label = c.labelKey ? t(c.labelKey) : status;
    return (
      <Badge color={c.color} className="w-fit">
        {label}
      </Badge>
    );
  };

  const handleApproveClick = (req: { id: number; order: { order_number: string }; amount: number }) => {
    setActionModal({
      type: "approve",
      id: req.id,
      orderNumber: req.order?.order_number || "",
      amount: req.amount,
    });
  };

  const handleRejectClick = (req: { id: number; order: { order_number: string }; amount: number }) => {
    setActionModal({
      type: "reject",
      id: req.id,
      orderNumber: req.order?.order_number || "",
      amount: req.amount,
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { type, id } = actionModal;
    try {
      if (type === "approve") {
        await approveRequest(id).unwrap();
        showNotification("success", t("refundRequests.success"), t("refundRequests.approveSuccess"));
      } else {
        await rejectRequest(id).unwrap();
        showNotification("success", t("refundRequests.success"), t("refundRequests.rejectSuccess"));
      }
      setActionModal(null);
    } catch (err: any) {
      showNotification(
        "error",
        t("refundRequests.error"),
        err?.data?.message || (type === "approve" ? t("refundRequests.approveError") : t("refundRequests.rejectError"))
      );
      setActionModal(null);
    }
  };

  const handleCancelAction = () => {
    setActionModal(null);
  };

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
            <h3 className="text-lg font-semibold text-error mb-1">{t("refundRequests.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("refundRequests.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  const list = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            {t("refundRequests.title")}
          </h1>
          <p className="text-sm text-ld mt-2">{t("refundRequests.subtitle")}</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="statusFilter" className="mb-2 block">
              {t("refundRequests.status")}
            </Label>
            <Select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("refundRequests.allStatuses")}</option>
              <option value="pending">{t("refundRequests.status.pending")}</option>
              <option value="approved">{t("refundRequests.status.approved")}</option>
              <option value="rejected">{t("refundRequests.status.rejected")}</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              color="gray"
              onClick={() => {
                setStatusFilter("");
                setCurrentPage(1);
              }}
            >
              {t("refundRequests.reset")}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.orderNumber")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.customer")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.amount")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.status")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.createdAt")}</th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">{t("refundRequests.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((req, index) => (
                <tr
                  key={req.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-dark dark:text-white">
                    {pagination ? pagination.from + index : index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/show/${req.order_id}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {req.order?.order_number ?? req.order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-dark dark:text-white">
                        {req.customer?.name ?? "-"}
                      </div>
                      <div className="text-xs text-ld dark:text-white/70">
                        {req.customer?.phone ?? ""}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-dark dark:text-white">
                    {formatCurrency(req.amount)}
                  </td>
                  <td style={{ display: "flex", justifyContent: "center", textAlign: "center" }} className="px-4 py-3">{getStatusBadge(req.status)}</td>
                  <td className="px-4 py-3 text-ld dark:text-white/70 whitespace-nowrap">
                    {formatDate(req.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveClick(req)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 text-sm font-medium"
                          title={t("refundRequests.approve")}
                        >
                          <Icon icon="solar:check-circle-bold" height={16} />
                          {t("refundRequests.approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectClick(req)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 text-sm font-medium"
                          title={t("refundRequests.reject")}
                        >
                          <Icon icon="solar:close-circle-bold" height={16} />
                          {t("refundRequests.reject")}
                        </button>
                      </div>
                    )}
                    {req.status !== "pending" && (
                      <span className="text-ld dark:text-white/70 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {list.length === 0 && (
            <div className="text-center py-12">
              <Icon
                icon="solar:refresh-line-duotone"
                height={64}
                className="text-ld mx-auto mb-4"
              />
              <p className="text-ld dark:text-white/70">{t("refundRequests.noRequests")}</p>
            </div>
          )}
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("refundRequests.showing", {
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
              previousLabel={t("refundRequests.previous")}
              nextLabel={t("refundRequests.next")}
            />
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={!!actionModal}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={
          actionModal?.type === "approve"
            ? t("refundRequests.confirmApprove")
            : t("refundRequests.confirmReject")
        }
        message={
          actionModal
            ? actionModal.type === "approve"
              ? t("refundRequests.approveMessage", {
                  orderNumber: actionModal.orderNumber,
                  amount: formatCurrency(actionModal.amount),
                })
              : t("refundRequests.rejectMessage", { orderNumber: actionModal.orderNumber })
            : ""
        }
        confirmText={
          actionModal?.type === "approve"
            ? t("refundRequests.approve")
            : t("refundRequests.reject")
        }
        cancelText={t("refundRequests.cancel")}
        isLoading={approving || rejecting}
        type={actionModal?.type === "approve" ? "info" : "danger"}
      />
    </div>
  );
};

export default RefundRequestsPage;
