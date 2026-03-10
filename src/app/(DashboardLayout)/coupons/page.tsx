"use client";

import React, { useMemo, useState } from "react";
import { Badge, Button, Card, Pagination, Spinner, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import { useDeleteCouponMutation, useGetCouponsQuery, useToggleCouponActiveMutation } from "@/store/api/couponsApi";

const CouponsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<{ id: number; code: string } | null>(null);

  const { data: couponsData, isLoading, error } = useGetCouponsQuery({
    search: searchQuery || undefined,
    page: currentPage,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();
  const [toggleCouponActive, { isLoading: toggling }] = useToggleCouponActiveMutation();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const discountLabel = (discount_type: string, discount_value: number) => {
    if (discount_type === "percentage") return `${discount_value}%`;
    return `${discount_value} KWD`;
  };

  const now = useMemo(() => new Date(), []);
  const getStatusBadge = (isActive: boolean, expiresAt?: string | null) => {
    if (!isActive) return <Badge color="failure" className="w-fit mx-auto">{t("coupons.inactive")}</Badge>;
    if (expiresAt && new Date(expiresAt) < now) return <Badge color="warning" className="w-fit mx-auto">{t("coupons.expired")}</Badge>;
    return <Badge color="success" className="w-fit mx-auto">{t("coupons.active")}</Badge>;
  };

  const handleDeleteClick = (id: number, code: string) => {
    setCouponToDelete({ id, code });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      const result = await deleteCoupon(couponToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setCouponToDelete(null);
        showNotification("success", t("coupons.success"), t("coupons.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setCouponToDelete(null);
      showNotification("error", t("coupons.error"), err?.data?.message || t("coupons.deleteError"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setCouponToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("coupons.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("coupons.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("coupons.title")}</h1>
          <p className="text-sm text-ld">{t("coupons.subtitle")}</p>
        </div>
        <HasPermission resource="coupons" action="add">
          <Link href="/coupons/add">
            <Button color="blue">
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              {t("coupons.addNew")}
            </Button>
          </Link>
        </HasPermission>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("coupons.allCoupons")}</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("coupons.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("coupons.code")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.type")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.discount")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.discountType")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.minimumOrderAmount")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.usage")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.startsAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.expiresAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("coupons.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {couponsData?.data?.map((coupon, index) => (
                <tr key={coupon.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {couponsData.pagination ? (couponsData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono font-semibold text-dark dark:text-white">{coupon.code}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/80">
                    {coupon.type === "product_variant"
                      ? t("coupons.typeProductVariant")
                      : t("coupons.typeGeneral")}
                  </td>
                  <td className="px-6 py-4 text-center text-dark dark:text-white font-medium">
                    {discountLabel(coupon.discount_type, coupon.discount_value)}
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/80">
                    {coupon.discount_type === "percentage"
                      ? t("coupons.discountTypePercentage")
                      : t("coupons.discountTypeFixed")}
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/70">
                    {(coupon.minimum_order_amount ?? 0) > 0 ? `${coupon.minimum_order_amount} KWD` : "—"}
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/70">
                    {coupon.used_count} / {coupon.usage_limit ?? "∞"}
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/70">
                    {formatDate(coupon.starts_at)}
                  </td>
                  <td className="px-6 py-4 text-center text-ld dark:text-white/70">
                    {formatDate(coupon.expires_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ToggleSwitch
                        color="success"
                        checked={!!coupon.is_active}
                        disabled={toggling}
                        onChange={() => toggleCouponActive(coupon.id)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <HasPermission resource="coupons" action="edit">
                        <Link href={`/coupons/edit/${coupon.id}`}>
                          <button
                            className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                            title={t("coupons.edit")}
                          >
                            <Icon icon="solar:pen-bold" height={18} className="text-primary" />
                          </button>
                        </Link>
                      </HasPermission>
                      <HasPermission resource="coupons" action="delete">
                        <button
                          onClick={() => handleDeleteClick(coupon.id, coupon.code)}
                          className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                          title={t("coupons.delete")}
                          disabled={deleting}
                        >
                          <Icon icon="solar:trash-bin-minimalistic-bold" height={18} className="text-error" />
                        </button>
                      </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {couponsData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:ticket-sale-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("coupons.noCoupons")}</p>
            </div>
          )}
        </div>

        {couponsData?.pagination && couponsData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("coupons.showing", { from: couponsData.pagination.from, to: couponsData.pagination.to, total: couponsData.pagination.total })}
            </div>
            <Pagination
              currentPage={couponsData.pagination.current_page}
              totalPages={couponsData.pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("coupons.previous")}
              nextLabel={t("coupons.next")}
            />
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("coupons.confirmDelete")}
        message={t("coupons.deleteMessage", { code: couponToDelete?.code })}
        confirmText={t("coupons.delete")}
        cancelText={t("coupons.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CouponsPage;

