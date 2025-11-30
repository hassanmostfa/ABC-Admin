"use client";
import React, { useState } from "react";
import { Card, Label, TextInput, Spinner, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useLazySearchCustomerByPhoneQuery, useCreateCustomerMutation } from "@/store/api/customersApi";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";

const EnterSaleOrderPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [searchCustomer, { isLoading: searching }] = useLazySearchCustomerByPhoneQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();

  const [phoneSearch, setPhoneSearch] = useState("");
  const [customerFound, setCustomerFound] = useState<any>(null);
  const [customerNotFound, setCustomerNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "+965 ",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSearch = async () => {
    if (!phoneSearch.trim()) {
      showNotification("error", t("enterSaleOrder.error"), t("enterSaleOrder.enterPhone"));
      return;
    }

    setCustomerNotFound(false);
    setCustomerFound(null);

    try {
      const result = await searchCustomer(phoneSearch).unwrap();
      if (result.success && result.data) {
        setCustomerFound(result.data);
        setCustomerNotFound(false);
        // Navigate to next page with customer data
        router.push(`/enter-sale-order/create?customer_id=${result.data.id}`);
      }
    } catch (err: any) {
      setCustomerNotFound(true);
      setCustomerFound(null);
      showNotification("error", t("enterSaleOrder.error"), t("enterSaleOrder.customerNotFound"));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!formData.name.trim()) {
      setFieldErrors({ name: t("customers.enterName") });
      showNotification("error", t("enterSaleOrder.error"), t("customers.enterName"));
      return;
    }

    try {
      const result = await createCustomer({
        name: formData.name.trim(),
        phone: formData.phone || undefined,
        is_active: true,
      }).unwrap();

      if (result.success && result.data) {
        showNotification("success", t("enterSaleOrder.success"), t("enterSaleOrder.customerCreated"));
        // Navigate to next page with new customer data
        router.push(`/enter-sale-order/create?customer_id=${result.data.id}`);
      }
    } catch (err: any) {
      const errors = err?.data?.errors || {};
      const newFieldErrors: Record<string, string> = {};
      Object.keys(errors).forEach((key) => {
        const messages = errors[key];
        if (Array.isArray(messages) && messages.length > 0) {
          newFieldErrors[key] = messages[0];
        }
      });
      setFieldErrors(newFieldErrors);
      showNotification("error", t("enterSaleOrder.error"), err?.data?.message || t("customers.addError"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white">{t("enterSaleOrder.title")}</h1>
        <p className="text-sm text-ld mt-2">{t("enterSaleOrder.subtitle")}</p>
      </div>

      {/* Search Customer Section */}
      <Card>
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("enterSaleOrder.searchCustomer")}</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneSearch" className="mb-2 block">{t("enterSaleOrder.phoneNumber")}</Label>
            <div className="flex gap-2">
              <TextInput
                id="phoneSearch"
                type="text"
                placeholder={t("enterSaleOrder.phonePlaceholder")}
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                icon={() => <Icon icon="solar:phone-calling-bold" height={18} />}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={searching}
                className="bg-primary hover:bg-primary/90"
              >
                {searching ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Icon icon="solar:magnifer-bold" height={18} className="ml-2" />
                    {t("enterSaleOrder.search")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {customerNotFound && (
            <div className="p-4 bg-lighterror dark:bg-darkerror border border-error rounded-lg">
              <p className="text-error text-sm">{t("enterSaleOrder.customerNotFoundMessage")}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create Customer Form */}
      <Card>
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("enterSaleOrder.createCustomer")}</h2>
        <form onSubmit={handleCreateCustomer}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">{t("customers.name")} *</Label>
              <TextInput
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t("customers.namePlaceholder")}
                icon={() => <Icon icon="solar:user-bold" height={18} />}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-error">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">{t("customers.phone")}</Label>
              <TextInput
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t("customers.phonePlaceholder")}
                icon={() => <Icon icon="solar:phone-calling-bold" height={18} />}
                className="ltr"
                dir="ltr"
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-error">{fieldErrors.phone}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {creating ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  {t("enterSaleOrder.creating")}
                </>
              ) : (
                <>
                  <Icon icon="solar:add-circle-bold" height={20} className="ml-2" />
                  {t("enterSaleOrder.createCustomer")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EnterSaleOrderPage;

