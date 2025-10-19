"use client";
import React, { useEffect, useState } from "react";
import { Card, Label, TextInput, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCustomerByIdQuery, useUpdateCustomerMutation } from "@/store/api/customersApi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";

const EditCustomer = () => {
  const router = useRouter();
  const params = useParams();
  const customerId = Number(params.id);
  const { showNotification } = useNotification();

  const { data: customerData, isLoading } = useGetCustomerByIdQuery(customerId);
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+965 ",
    is_active: true,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (customerData?.data && !initialized) {
      setFormData({
        name: customerData.data.name || "",
        email: customerData.data.email || "",
        phone: customerData.data.phone || "+965 ",
        is_active: customerData.data.is_active ?? true,
      });
      setInitialized(true);
    }
  }, [customerData, initialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = () => {
    setFormData((prev) => ({ ...prev, is_active: !prev.is_active }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification("error", "خطأ!", "يرجى إدخال اسم العميل");
      return;
    }

    try {
      const result = await updateCustomer({
        id: customerId,
        data: {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          is_active: formData.is_active,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم تحديث بيانات العميل بنجاح");
        setTimeout(() => {
          router.push("/customers");
        }, 1200);
      }
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء تحديث بيانات العميل");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-dark dark:text-white">تعديل بيانات العميل</h1>
          </div>
          <p className="text-sm text-ld mr-12">تحديث معلومات العميل</p>
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
              <TextInput id="name" name="name" placeholder="اسم العميل" value={formData.name} onChange={handleInputChange} required icon={() => <Icon icon="solar:user-bold" height={18} />} />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">البريد الإلكتروني</Label>
              <TextInput id="email" name="email" type="email" placeholder="example@abc.com" value={formData.email} onChange={handleInputChange} icon={() => <Icon icon="solar:letter-bold" height={18} />} />
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
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700">
              <div>
                <Label className="text-base font-medium text-gray-900 dark:text-white block mb-1">
                  حالة العميل
                </Label>
                <p className={`text-sm ${formData.is_active ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {formData.is_active ? "🟢 العميل نشط" : "🔴 العميل غير نشط"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.is_active ? "يمكن للعميل استخدام النظام" : "العميل غير قادر على استخدام النظام"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/customers">
              <button type="button" className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors">إلغاء</button>
            </Link>
            <button type="submit" disabled={updating} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              {updating ? (<><Spinner size="sm" /> جاري الحفظ...</>) : (<><Icon icon="solar:diskette-bold" height={20} /> حفظ التغييرات</>)}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditCustomer;