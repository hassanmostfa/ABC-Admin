"use client";

import React, { useState } from "react";
import { Card, Label, TextInput, Button, Checkbox } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateCountryMutation } from "@/store/api/countriesApi";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";

const AddCountryPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createCountry, { isLoading: creating }] = useCreateCountryMutation();

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    is_active: true,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return t("countries.enterNameAr");
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return t("countries.nameMinLength");
    }
    
    if (cleanName.length > 50) {
      return t("countries.nameMaxLength");
    }
    
    return "";
  };

  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return t("countries.enterNameEn");
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return t("countries.nameMinLength");
    }
    
    if (cleanName.length > 50) {
      return t("countries.nameMaxLength");
    }
    
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Clean up extra spaces in real-time
      const cleanValue = value.replace(/\s+/g, ' ');
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const extractErrorMessage = (err: any): string => {
    const apiErrors = err?.data?.errors;
    if (apiErrors && typeof apiErrors === "object") {
      const firstField = Object.keys(apiErrors)[0];
      return apiErrors[firstField][0];
    }
    return err?.data?.message || t("countries.unexpectedError");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate all fields
    const nameArError = validateNameAr(formData.name_ar);
    const nameEnError = validateNameEn(formData.name_en);

    if (nameArError || nameEnError) {
      setFieldErrors({
        ...(nameArError && { name_ar: nameArError }),
        ...(nameEnError && { name_en: nameEnError }),
      });
      showNotification("error", t("countries.error"), t("countries.correctErrors"));
      return;
    }

    try {
      const result = await createCountry({
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        is_active: formData.is_active,
      }).unwrap();

      if (result.success) {
        showNotification("success", t("countries.success"), t("countries.addSuccess"));
        setTimeout(() => {
          router.push("/countries");
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      showNotification("error", t("countries.error"), errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            {t("countries.addNew")}
          </h1>
          <p className="text-sm text-ld mt-2">
            {t("countries.addDescription")}
          </p>
        </div>
        <Link href="/countries">
          <button className="px-4 py-2 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors flex items-center gap-2">
            <Icon icon="solar:arrow-right-bold" height={20} />
            {t("countries.backToList")}
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name_ar" className="mb-2 block">
                {t("countries.nameAr")} <span className="text-error">*</span>
              </Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder={t("countries.nameArPlaceholder")} 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:flag-bold" height={18} />} 
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">{t("countries.enterNameArHelper")}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name_en" className="mb-2 block">
                {t("countries.nameEn")} <span className="text-error">*</span>
              </Label>
              <TextInput 
                id="name_en" 
                name="name_en" 
                placeholder="Country Name in English" 
                value={formData.name_en} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:flag-bold" height={18} />} 
              />
              {fieldErrors.name_en ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_en}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">{t("countries.enterNameEnHelper")}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-dark dark:text-white">
                  {t("countries.countryActive")}
                </Label>
              </div>
              <p className="mt-1 text-xs text-gray-500">{t("countries.countryActiveHelper")}</p>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/countries">
              <button
                type="button"
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
              >
                {t("countries.cancel")}
              </button>
            </Link>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Icon icon="solar:loading-bold" className="w-4 h-4 animate-spin" />
                  {t("countries.saving")}
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" height={20} />
                  {t("countries.saveCountry")}
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddCountryPage;
