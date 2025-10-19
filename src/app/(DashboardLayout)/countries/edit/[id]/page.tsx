"use client";

import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Button, Checkbox } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useGetCountryByIdQuery, useUpdateCountryMutation } from "@/store/api/countriesApi";
import { useNotification } from "@/app/context/NotificationContext";

const EditCountryPage = () => {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();
  const countryId = parseInt(params.id as string);

  const { data: countryData, isLoading: loadingCountry, error } = useGetCountryByIdQuery(countryId);
  const [updateCountry, { isLoading: updating }] = useUpdateCountryMutation();

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    is_active: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Update form data when country data is loaded
  useEffect(() => {
    if (countryData?.data && !initialized) {
      setFormData({
        name_ar: countryData.data.name_ar || "",
        name_en: countryData.data.name_en || "",
        is_active: countryData.data.is_active ?? false,
      });
      setInitialized(true);
    }
  }, [countryData, initialized]);

  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم الدولة بالعربية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "اسم الدولة يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 50) {
      return "اسم الدولة يجب أن لا يتجاوز 50 حرف";
    }
    
    return "";
  };

  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم الدولة بالإنجليزية";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "اسم الدولة يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 50) {
      return "اسم الدولة يجب أن لا يتجاوز 50 حرف";
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
    return err?.data?.message || "حدث خطأ غير متوقع";
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
      showNotification("error", "خطأ!", "يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    try {
      const result = await updateCountry({
        id: countryId,
        countryData: {
          name_ar: formData.name_ar.trim(),
          name_en: formData.name_en.trim(),
          is_active: formData.is_active,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم تحديث الدولة بنجاح");
        setTimeout(() => {
          router.push("/countries");
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      showNotification("error", "خطأ!", errorMessage);
    }
  };

  if (loadingCountry) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Icon icon="solar:loading-bold" className="w-8 h-8 text-primary animate-spin ml-2" />
          <span className="text-gray-500 dark:text-gray-400">جاري تحميل بيانات الدولة...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon icon="solar:danger-circle-bold" className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">حدث خطأ أثناء تحميل بيانات الدولة</p>
          <Link href="/countries">
            <Button color="gray">العودة للقائمة</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!countryData?.data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon icon="solar:file-search-bold" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">الدولة غير موجودة</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">الدولة المطلوبة غير موجودة في النظام</p>
          <Link href="/countries">
            <Button color="gray">العودة للقائمة</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            تعديل الدولة
          </h1>
          <p className="text-sm text-ld mt-2">
            تعديل بيانات الدولة: {countryData.data.name_ar}
          </p>
        </div>
        <Link href="/countries">
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
                اسم الدولة (عربي) <span className="text-error">*</span>
              </Label>
              <TextInput 
                id="name_ar" 
                name="name_ar" 
                placeholder="اسم الدولة بالعربية" 
                value={formData.name_ar} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:flag-bold" height={18} />} 
              />
              {fieldErrors.name_ar ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name_ar}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل اسم الدولة بالعربية</p>
              )}
            </div>

            <div>
              <Label htmlFor="name_en" className="mb-2 block">
                اسم الدولة (إنجليزي) <span className="text-error">*</span>
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
                <p className="mt-1 text-xs text-gray-500">أدخل اسم الدولة بالإنجليزية</p>
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
                  الدولة نشطة
                </Label>
              </div>
              <p className="mt-1 text-xs text-gray-500">حدد ما إذا كانت الدولة نشطة أم لا</p>
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
                إلغاء
              </button>
            </Link>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Icon icon="solar:loading-bold" className="w-4 h-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" height={20} />
                  تحديث الدولة
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditCountryPage;
