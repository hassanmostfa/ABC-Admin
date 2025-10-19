"use client";

import React, { useState } from "react";
import { Card, Label, TextInput, Button, Checkbox, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateGovernorateMutation } from "@/store/api/governoratesApi";
import { useGetAllCountriesQuery } from "@/store/api/countriesApi";
import { useNotification } from "@/app/context/NotificationContext";

const AddGovernoratePage = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createGovernorate, { isLoading: creating }] = useCreateGovernorateMutation();
  const { data: countriesData } = useGetAllCountriesQuery();

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    is_active: true,
    country_id: 0,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم المحافظة بالعربية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "اسم المحافظة يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 50) {
      return "اسم المحافظة يجب أن لا يتجاوز 50 حرف";
    }
    
    return "";
  };

  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم المحافظة بالإنجليزية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "اسم المحافظة يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 50) {
      return "اسم المحافظة يجب أن لا يتجاوز 50 حرف";
    }
    
    return "";
  };

  const validateCountry = (countryId: number): string => {
    if (!countryId || countryId === 0) {
      return "يرجى اختيار الدولة";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'country_id') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
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
    return err?.data?.message || "حدث خطأ غير متوقع";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate all fields
    const nameArError = validateNameAr(formData.name_ar);
    const nameEnError = validateNameEn(formData.name_en);
    const countryError = validateCountry(formData.country_id);

    if (nameArError || nameEnError || countryError) {
      setFieldErrors({
        ...(nameArError && { name_ar: nameArError }),
        ...(nameEnError && { name_en: nameEnError }),
        ...(countryError && { country_id: countryError }),
      });
      showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    try {
      const result = await createGovernorate({
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        is_active: formData.is_active,
        country_id: formData.country_id,
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم إضافة المحافظة بنجاح");
        setTimeout(() => {
          router.push("/governorates");
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      showNotification("error", "خطأ!", errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            إضافة محافظة جديدة
          </h1>
          <p className="text-sm text-ld mt-2">
            أضف محافظة جديدة إلى النظام
          </p>
        </div>
        <Link href="/governorates">
          <button className="px-4 py-2 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors flex items-center gap-2">
            <Icon icon="solar:arrow-right-bold" height={20} />
            العودة للقائمة
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name_ar" className="mb-2 block">
                اسم المحافظة (عربي) <span className="text-error">*</span>
              </Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder="اسم المحافظة بالعربية" 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:buildings-2-bold" height={18} />} 
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل اسم المحافظة بالعربية</p>
              )}
            </div>

            <div>
              <Label htmlFor="name_en" className="mb-2 block">
                اسم المحافظة (إنجليزي) <span className="text-error">*</span>
              </Label>
              <TextInput 
                id="name_en" 
                name="name_en" 
                placeholder="Governorate Name in English" 
                value={formData.name_en} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:buildings-2-bold" height={18} />} 
              />
              {fieldErrors.name_en ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_en}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل اسم المحافظة بالإنجليزية</p>
              )}
            </div>

            <div>
              <Label htmlFor="country_id" className="mb-2 block">
                الدولة <span className="text-error">*</span>
              </Label>
              <Select
                id="country_id"
                name="country_id"
                value={formData.country_id}
                onChange={handleInputChange}
                required
                className="select-md"
                icon={() => <Icon icon="solar:flag-bold" height={18} />}
              >
                <option value={0}>اختر الدولة</option>
                {countriesData?.data?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name_ar}
                  </option>
                ))}
              </Select>
              {fieldErrors.country_id ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.country_id}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">اختر الدولة التابعة لها المحافظة</p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <Label htmlFor="is_active" className="text-sm font-medium text-dark dark:text-white">
                  المحافظة نشطة
                </Label>
              </div>
              <p className="mt-1 text-xs text-gray-500">حدد ما إذا كانت المحافظة نشطة أم لا</p>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/governorates">
              <button
                type="button"
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
              >
                إلغاء
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
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" height={20} />
                  حفظ المحافظة
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddGovernoratePage;
