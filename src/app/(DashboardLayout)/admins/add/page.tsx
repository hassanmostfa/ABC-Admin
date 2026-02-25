"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useCreateAdminMutation } from "@/store/api/adminsApi";
import { useGetAllRolesQuery } from "@/store/api/rolesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";

const AddAdmin = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { data: rolesData, isLoading: loadingRoles } = useGetAllRolesQuery();
  const [createAdmin, { isLoading: creatingAdmin }] = useCreateAdminMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+965 ",
    password: "",
    role_id: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      showNotification("error", t("admins.error"), t("admins.enterName"));
      return;
    }

    if (!formData.email.trim()) {
      showNotification("error", t("admins.error"), t("admins.enterEmail"));
      return;
    }

    if (!formData.password.trim() || formData.password.length < 8) {
      showNotification("error", t("admins.error"), t("admins.passwordMinLength"));
      return;
    }

    if (!formData.role_id) {
      showNotification("error", t("admins.error"), t("admins.selectRole"));
      return;
    }

    try {
      const result = await createAdmin({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role_id: Number(formData.role_id),
        is_active: true,
      }).unwrap();

      if (result.success) {
        showNotification("success", t("admins.success"), t("admins.addSuccess"));
        setTimeout(() => {
          router.push("/admins");
        }, 1500);
      }
    } catch (err: any) {
      showNotification(
        "error",
        t("admins.error"),
        err?.data?.message || t("admins.addError")
      );
    }
  };

  if (loadingRoles) {
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
              {t("admins.addNew")}
            </h1>
          </div>
          <p className="text-sm text-ld mr-12">
            {t("admins.addDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                {t("admins.name")} <span className="text-error">*</span>
              </Label>
              <TextInput
                id="name"
                name="name"
                placeholder={t("admins.enterName")}
                value={formData.name}
                onChange={handleInputChange}
                required
                icon={() => <Icon icon="solar:user-bold" height={18} />}
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                {t("admins.email")} <span className="text-error">*</span>
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
              <Label htmlFor="phone" className="mb-2 block">{t("admins.phone")}</Label>
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
                <p className="mt-1 text-xs text-gray-500">{t("admins.enterPhoneFull")}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                {t("admins.password")} <span className="text-error">*</span>
              </Label>
              <TextInput
                id="password"
                name="password"
                type="password"
                placeholder={t("admins.passwordPlaceholder")}
                value={formData.password}
                onChange={handleInputChange}
                required
                icon={() => <Icon icon="solar:lock-password-bold" height={18} />}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role_id" className="mb-2 block">
                {t("admins.role")} <span className="text-error">*</span>
              </Label>
              <Select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                required
                className="select-md"
              >
                <option value="">{t("admins.chooseRole")}</option>
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
                {t("admins.cancel")}
              </button>
            </Link>
            <button
              type="submit"
              disabled={creatingAdmin}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {creatingAdmin ? (
                <>
                  <Spinner size="sm" />
                  {t("admins.saving")}
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" height={20} />
                  {t("admins.saveAdmin")}
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddAdmin;

