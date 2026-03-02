"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Label, Select, Spinner, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import { CouponDiscountType, useGetCouponByIdQuery, useUpdateCouponMutation } from "@/store/api/couponsApi";

interface EditCouponPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCouponPage = ({ params }: EditCouponPageProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const router = useRouter();

  const resolvedParams = React.use(params);
  const couponId = parseInt(resolvedParams.id);

  const { data: couponData, isLoading: loadingData, error } = useGetCouponByIdQuery(couponId);
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "fixed" as CouponDiscountType,
    discount_value: "",
    usage_limit: "",
    used_count: 0,
    starts_at: "",
    expires_at: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!couponData?.data) return;
    const c = couponData.data;
    setFormData({
      code: c.code || "",
      discount_type: c.discount_type || "fixed",
      discount_value: String(c.discount_value ?? ""),
      usage_limit: c.usage_limit == null ? "" : String(c.usage_limit),
      used_count: c.used_count ?? 0,
      starts_at: c.starts_at ? new Date(c.starts_at).toISOString().split("T")[0] : "",
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().split("T")[0] : "",
      is_active: !!c.is_active,
    });
  }, [couponData]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.code.trim()) e.code = t("coupons.codeRequired");
    if (!formData.discount_value || Number(formData.discount_value) <= 0) e.discount_value = t("coupons.discountValueRequired");
    if (!formData.starts_at) e.starts_at = t("coupons.startRequired");
    if (!formData.expires_at) e.expires_at = t("coupons.expiryRequired");
    if (formData.starts_at && formData.expires_at) {
      const s = new Date(formData.starts_at);
      const x = new Date(formData.expires_at);
      if (s > x) e.expires_at = t("coupons.expiryAfterStart");
    }
    if (formData.usage_limit && Number(formData.usage_limit) < 0) e.usage_limit = t("coupons.usageLimitInvalid");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      await updateCoupon({
        id: couponId,
        data: {
          code: formData.code.trim(),
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
          starts_at: formData.starts_at || null,
          expires_at: formData.expires_at || null,
          is_active: formData.is_active,
        },
      }).unwrap();

      showNotification("success", t("coupons.success"), t("coupons.updateSuccess"));
      router.push("/coupons");
    } catch (err: any) {
      showNotification("error", t("coupons.error"), err?.data?.message || t("coupons.updateError"));
    }
  };

  if (loadingData) {
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
            <p className="text-sm text-dark dark:text-white">{t("coupons.loadOneError")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("coupons.editTitle")}</h1>
          <p className="text-sm text-ld">{t("coupons.editSubtitle")}</p>
        </div>
        <Link href="/coupons">
          <Button color="gray">
            <Icon icon="solar:arrow-right-bold" height={18} className="ml-1" />
            {t("coupons.back")}
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">{t("coupons.code")}</Label>
              <TextInput
                value={formData.code}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }));
                  if (errors.code) setErrors((p) => ({ ...p, code: "" }));
                }}
                placeholder={t("coupons.codePlaceholder")}
                color={errors.code ? "failure" : "gray"}
              />
              {errors.code ? <p className="text-xs text-error mt-1">{errors.code}</p> : null}
            </div>

            <div>
              <Label className="mb-2 block">{t("coupons.discountType")}</Label>
              <Select
                value={formData.discount_type}
                onChange={(e) => setFormData((p) => ({ ...p, discount_type: e.target.value as CouponDiscountType }))}
              >
                <option value="fixed">{t("coupons.discountTypeFixed")}</option>
                <option value="percentage">{t("coupons.discountTypePercentage")}</option>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">{t("coupons.discountValue")}</Label>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_value}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, discount_value: e.target.value }));
                  if (errors.discount_value) setErrors((p) => ({ ...p, discount_value: "" }));
                }}
                placeholder={t("coupons.discountValuePlaceholder")}
                color={errors.discount_value ? "failure" : "gray"}
              />
              {errors.discount_value ? <p className="text-xs text-error mt-1">{errors.discount_value}</p> : null}
            </div>

            <div>
              <Label className="mb-2 block">{t("coupons.usageLimit")}</Label>
              <TextInput
                type="number"
                min="0"
                value={formData.usage_limit}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, usage_limit: e.target.value }));
                  if (errors.usage_limit) setErrors((p) => ({ ...p, usage_limit: "" }));
                }}
                placeholder={t("coupons.usageLimitPlaceholder")}
                color={errors.usage_limit ? "failure" : "gray"}
              />
              {errors.usage_limit ? <p className="text-xs text-error mt-1">{errors.usage_limit}</p> : null}
              <p className="text-xs text-ld dark:text-white/70 mt-1">
                {t("coupons.usedCount")}: {formData.used_count}
              </p>
            </div>

            <div>
              <Label className="mb-2 block">{t("coupons.startDate")}</Label>
              <TextInput
                type="date"
                value={formData.starts_at}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, starts_at: e.target.value }));
                  if (errors.starts_at) setErrors((p) => ({ ...p, starts_at: "" }));
                }}
                color={errors.starts_at ? "failure" : "gray"}
              />
              {errors.starts_at ? <p className="text-xs text-error mt-1">{errors.starts_at}</p> : null}
            </div>

            <div>
              <Label className="mb-2 block">{t("coupons.endDate")}</Label>
              <TextInput
                type="date"
                value={formData.expires_at}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, expires_at: e.target.value }));
                  if (errors.expires_at) setErrors((p) => ({ ...p, expires_at: "" }));
                }}
                color={errors.expires_at ? "failure" : "gray"}
              />
              {errors.expires_at ? <p className="text-xs text-error mt-1">{errors.expires_at}</p> : null}
            </div>

            <div className="lg:col-span-2 flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Icon icon="solar:check-circle-bold" height={18} className="text-primary" />
                <span className="text-sm text-dark dark:text-white">{t("coupons.isActive")}</span>
              </div>
              <ToggleSwitch
                checked={formData.is_active}
                label={formData.is_active ? t("coupons.active") : t("coupons.inactive")}
                onChange={(v) => setFormData((p) => ({ ...p, is_active: v }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-ld">
            <Link href="/coupons">
              <Button color="gray" type="button">
                {t("coupons.cancel")}
              </Button>
            </Link>
            <Button type="submit" color="blue" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  {t("coupons.saving")}
                </>
              ) : (
                t("coupons.saveChanges")
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditCouponPage;

