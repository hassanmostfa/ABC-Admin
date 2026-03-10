"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Label, Select, Spinner, TextInput, ToggleSwitch } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import { CouponDiscountType, CouponType, useGetCouponByIdQuery, useUpdateCouponMutation } from "@/store/api/couponsApi";
import SearchableSelect from "@/components/shared/SearchableSelect";

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

  type ProductVariantRow = { product_id: number; product_variant_id: number };
  const [productVariantRows, setProductVariantRows] = useState<ProductVariantRow[]>([
    { product_id: 0, product_variant_id: 0 },
  ]);

  const [formData, setFormData] = useState({
    code: "",
    type: "general" as CouponType,
    discount_type: "fixed" as CouponDiscountType,
    discount_value: "",
    minimum_order_amount: "",
    usage_limit: "",
    used_count: 0,
    starts_at: "",
    expires_at: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addProductVariantRow = () => {
    setProductVariantRows((prev) => [...prev, { product_id: 0, product_variant_id: 0 }]);
  };

  const removeProductVariantRow = (index: number) => {
    setProductVariantRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProductVariantRow = (index: number, field: "product_id" | "product_variant_id", value: number) => {
    setProductVariantRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "product_id") next[index].product_variant_id = 0;
      return next;
    });
  };

  useEffect(() => {
    if (!couponData?.data) return;
    const c = couponData.data;
    setFormData({
      code: c.code || "",
      type: c.type || "general",
      discount_type: c.discount_type || "fixed",
      discount_value: String(c.discount_value ?? ""),
      minimum_order_amount: c.minimum_order_amount != null ? String(c.minimum_order_amount) : "",
      usage_limit: c.usage_limit == null ? "" : String(c.usage_limit),
      used_count: c.used_count ?? 0,
      starts_at: c.starts_at ? new Date(c.starts_at).toISOString().split("T")[0] : "",
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().split("T")[0] : "",
      is_active: !!c.is_active,
    });
    if (c.type !== "product_variant") {
      setProductVariantRows([{ product_id: 0, product_variant_id: 0 }]);
      return;
    }
    if (Array.isArray(c.product_variants) && c.product_variants.length > 0) {
      const rows: ProductVariantRow[] = c.product_variants.map((pv) => ({
        product_id: pv.product_id,
        product_variant_id: pv.id,
      }));
      setProductVariantRows(rows);
      return;
    }
    if (Array.isArray(c.product_variant_ids) && c.product_variant_ids.length > 0) {
      setProductVariantRows(
        c.product_variant_ids.map((vid) => ({ product_id: 0, product_variant_id: vid }))
      );
      return;
    }
    setProductVariantRows([{ product_id: 0, product_variant_id: 0 }]);
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
    const validVariantIds = productVariantRows
      .filter((r) => r.product_id > 0 && r.product_variant_id > 0)
      .map((r) => r.product_variant_id);
    if (formData.type === "product_variant" && validVariantIds.length === 0) {
      e.product_variants = t("coupons.productVariantIdsRequired");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const productVariantIds =
        formData.type === "product_variant"
          ? productVariantRows
              .filter((r) => r.product_id > 0 && r.product_variant_id > 0)
              .map((r) => r.product_variant_id)
          : undefined;

      await updateCoupon({
        id: couponId,
        data: {
          code: formData.code.trim(),
          type: formData.type,
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          minimum_order_amount: formData.minimum_order_amount ? Number(formData.minimum_order_amount) : undefined,
          usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
          starts_at: formData.starts_at || null,
          expires_at: formData.expires_at || null,
          is_active: formData.is_active,
          ...(formData.type === "product_variant" ? { product_variant_ids: productVariantIds ?? [] } : {}),
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
              <Label className="mb-2 block">{t("coupons.type")}</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as CouponType }))}
              >
                <option value="general">{t("coupons.typeGeneral")}</option>
                <option value="product_variant">{t("coupons.typeProductVariant")}</option>
              </Select>
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
              <Label className="mb-2 block">{t("coupons.minimumOrderAmount")}</Label>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData((p) => ({ ...p, minimum_order_amount: e.target.value }))}
                placeholder={t("coupons.minimumOrderAmountPlaceholder")}
                color="gray"
              />
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

            {formData.type === "product_variant" && (
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="block">{t("coupons.productVariantIds")}</Label>
                  <Button type="button" size="sm" onClick={addProductVariantRow}>
                    <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
                    {t("coupons.addProductVariant")}
                  </Button>
                </div>
                {errors.product_variants ? (
                  <p className="text-xs text-error">{errors.product_variants}</p>
                ) : null}
                <div className="space-y-3">
                  {productVariantRows.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <Label className="mb-1 block">{t("offers.product")}</Label>
                        <SearchableSelect
                          value={row.product_id}
                          onChange={(value) => updateProductVariantRow(index, "product_id", value)}
                          placeholder={t("offers.chooseProduct")}
                          showImage={true}
                          type="product"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block">{t("offers.productVariant")}</Label>
                        <SearchableSelect
                          value={row.product_variant_id}
                          onChange={(value) => updateProductVariantRow(index, "product_variant_id", value)}
                          placeholder={t("offers.chooseVariant")}
                          showImage={true}
                          showSize={true}
                          type="variant"
                          parentProductId={row.product_id}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          color="red"
                          onClick={() => removeProductVariantRow(index)}
                          disabled={productVariantRows.length === 1}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" height={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

