"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useCreateCustomerMutation } from "@/store/api/customersApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";

const AddCustomer = () => {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+965 ",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "يرجى إدخال اسم العميل";
    }
    
    // Remove extra spaces and validate length
    const cleanName = name.trim().replace(/\s+/g, ' ');
    
    if (cleanName.length < 2) {
      return "الاسم يجب أن يكون على الأقل حرفين";
    }
    
    if (cleanName.length > 50) {
      return "الاسم يجب أن لا يتجاوز 50 حرف";
    }
    
    // Arabic and English letters with spaces
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(cleanName)) {
      return "الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط";
    }
    
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For name field, clean up extra spaces in real-time
    if (name === "name") {
      const cleanValue = value.replace(/\s+/g, ' ');
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const extractErrorMessage = (err: any): string => {
    const apiErrors = err?.data?.errors;
    if (apiErrors && typeof apiErrors === "object") {
      const firstField = Object.keys(apiErrors)[0];
      const messages = apiErrors[firstField];
      if (Array.isArray(messages) && messages.length > 0) return messages[0];
    }
    return err?.data?.message || "حدث خطأ أثناء إضافة العميل";
  };

  const extractFieldErrors = (err: any): Record<string, string> => {
    const apiErrors = err?.data?.errors;
    const mapped: Record<string, string> = {};
    if (apiErrors && typeof apiErrors === "object") {
      Object.keys(apiErrors).forEach((key) => {
        const messages = apiErrors[key];
        if (Array.isArray(messages) && messages.length > 0) mapped[key] = messages[0];
      });
    }
    return mapped;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate name format
    const nameError = validateName(formData.name);
    if (nameError) {
      setFieldErrors({ name: nameError });
      showNotification("error", "خطأ!", nameError);
      return;
    }

    try {
      const result = await createCustomer({
        name: formData.name.trim(), // Trim before sending
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        is_active: true,
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم إضافة العميل بنجاح");
        setTimeout(() => {
          router.push("/customers");
        }, 1200);
      }
    } catch (err: any) {
      const fieldErrs = extractFieldErrors(err);
      if (Object.keys(fieldErrs).length > 0) setFieldErrors(fieldErrs);
      showNotification("error", "خطأ!", extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/customers">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">إضافة عميل جديد</h1>
          </div>
          <p className="text-sm text-ld mr-12">إنشاء حساب عميل جديد</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Removed theme toggle */}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">الاسم <span className="text-error">*</span></Label>
              <TextInput 
                id="name" 
                name="name" 
                placeholder="اسم العميل" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                icon={() => <Icon icon="solar:user-bold" height={18} />} 
              />
              {fieldErrors.name ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.name}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">يجب أن يحتوي على أحرف عربية أو إنجليزية فقط</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">البريد الإلكتروني</Label>
              <TextInput id="email" name="email" type="email" placeholder="example@abc.com" value={formData.email} onChange={handleInputChange} icon={() => <Icon icon="solar:letter-bold" height={18} />} />
              {fieldErrors.email ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">رقم الهاتف</Label>
              <TextInput 
                id="phone" 
                name="phone" 
                placeholder="+965 xxxx xxxx" 
                value={formData.phone} 
                onChange={handleInputChange} 
                style={{direction: "ltr"}}
                icon={() => <Icon icon="solar:phone-bold" height={18} />} 
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-xs text-error">{fieldErrors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">أدخل رقم الهاتف الكامل</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/customers">
              <button type="button" className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors">إلغاء</button>
            </Link>
            <button type="submit" disabled={creating} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              {creating ? (<><Spinner size="sm" /> جاري الحفظ...</>) : (<><Icon icon="solar:add-circle-bold" height={20} /> حفظ العميل</>)}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddCustomer;