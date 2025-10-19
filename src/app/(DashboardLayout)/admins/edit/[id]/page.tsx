"use client";
import React, { useEffect, useState } from "react";
import { Card, Label, TextInput, Spinner, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetAdminByIdQuery, useUpdateAdminMutation } from "@/store/api/adminsApi";
import { useGetAllRolesQuery } from "@/store/api/rolesApi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";

const EditAdmin = () => {
  const router = useRouter();
  const params = useParams();
  const adminId = Number(params.id);
  const { showNotification } = useNotification();

  const { data: rolesData, isLoading: loadingRoles } = useGetAllRolesQuery();
  const { data: adminData, isLoading: loadingAdmin } = useGetAdminByIdQuery(adminId);
  const [updateAdmin, { isLoading: updatingAdmin }] = useUpdateAdminMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+965 ",
    password: "",
    role_id: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (adminData?.data && !initialized) {
      setFormData({
        name: adminData.data.name || "",
        email: adminData.data.email || "",
        phone: adminData.data.phone || "+965 ",
        password: "",
        role_id: String(adminData.data.role_id || ""),
      });
      setInitialized(true);
    }
  }, [adminData, initialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showNotification("error", "خطأ!", "يرجى إدخال اسم المسؤول");
      return;
    }

    if (!formData.email.trim()) {
      showNotification("error", "خطأ!", "يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!formData.role_id) {
      showNotification("error", "خطأ!", "يرجى اختيار دور المسؤول");
      return;
    }

    // Validate password if provided
    if (formData.password && formData.password.length < 8) {
      showNotification("error", "خطأ!", "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role_id: Number(formData.role_id),
        is_active: true,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateAdmin({
        adminId,
        data: updateData,
      }).unwrap();

      if (result.success) {
        showNotification("success", "نجاح!", "تم تحديث بيانات المسؤول بنجاح");
        setTimeout(() => {
          router.push("/admins");
        }, 1200);
      }
    } catch (err: any) {
      showNotification(
        "error",
        "خطأ!",
        err?.data?.message || "حدث خطأ أثناء تحديث بيانات المسؤول"
      );
    }
  };

  if (loadingRoles || loadingAdmin) {
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
            <Link href="/admins">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">
              تعديل بيانات المسؤول
            </h1>
          </div>
          <p className="text-sm text-ld mr-12">قم بتحديث بيانات المسؤول وتغيير دوره</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                الاسم <span className="text-error">*</span>
              </Label>
              <TextInput
                id="name"
                name="name"
                placeholder="أدخل اسم المسؤول"
                value={formData.name}
                onChange={handleInputChange}
                required
                icon={() => <Icon icon="solar:user-bold" height={18} />}
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                البريد الإلكتروني <span className="text-error">*</span>
              </Label>
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="example@abc.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                icon={() => <Icon icon="solar:letter-bold" height={18} />}
              />
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

            <div>
              <Label htmlFor="password" className="mb-2 block">
                كلمة المرور الجديدة
              </Label>
              <TextInput
                id="password"
                name="password"
                type="password"
                placeholder="اتركها فارغة إذا كنت لا تريد تغيير كلمة المرور"
                value={formData.password}
                onChange={handleInputChange}
                icon={() => <Icon icon="solar:lock-password-bold" height={18} />}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role_id" className="mb-2 block">
                الدور <span className="text-error">*</span>
              </Label>
              <Select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                required
                className="select-md"
              >
                <option value="">اختر الدور</option>
                {rolesData?.data?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="mt-6">
          <div className="flex items-center justify-end gap-3">
            <Link href="/admins">
              <button
                type="button"
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
              >
                إلغاء
              </button>
            </Link>
            <button
              type="submit"
              disabled={updatingAdmin}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updatingAdmin ? (
                <>
                  <Spinner size="sm" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" height={20} />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditAdmin;
