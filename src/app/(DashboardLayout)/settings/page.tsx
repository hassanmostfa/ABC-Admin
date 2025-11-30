"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Button, Spinner, Tabs } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/api/settingsApi";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { data: settingsData, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"general" | "delivery">("general");

  useEffect(() => {
    if (settingsData?.data) {
      const settingsMap: Record<string, string> = {};
      settingsData.data.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    }
  }, [settingsData]);

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      const result = await updateSettings({ settings: settingsArray }).unwrap();

      if (result.success) {
        showNotification("success", t("settings.success"), t("settings.updateSuccess"));
      }
    } catch (err: any) {
      showNotification("error", t("settings.error"), err?.data?.message || t("settings.updateError"));
    }
  };

  // General settings
  const generalSettings = [
    { key: "otp_test_code", label: t("settings.otpTestCode"), type: "text" },
    { key: "tax", label: t("settings.tax"), type: "number", step: "0.01" },
    { key: "one_point_dicount", label: t("settings.onePointDiscount"), type: "number", step: "0.01" },
  ];

  // Delivery settings
  const deliverySettings = [
    { key: "opening_time", label: t("settings.openingTime"), type: "text" },
    { key: "closing_time", label: t("settings.closingTime"), type: "text" },
    { key: "delivery_days", label: t("settings.deliveryDays"), type: "number" },
    { key: "delivery_price", label: t("settings.deliveryPrice"), type: "number", step: "0.01" },
    { key: "minimum_charity_order", label: t("settings.minimumCharityOrder"), type: "number", step: "0.01" },
    { key: "minimum_home_order", label: t("settings.minimumHomeOrder"), type: "number", step: "0.01" },
    { key: "max_delivery_per_slot", label: t("settings.maxDeliveryPerSlot"), type: "number" },
    { key: "slot_interval", label: t("settings.slotInterval"), type: "number" },
    { key: "day_offs", label: t("settings.dayOffs"), type: "text" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("settings.title")}</h1>
          <p className="text-ld mt-1">{t("settings.subtitle")}</p>
        </div>
      </div>

      <Card>
        <Tabs activeTab={activeTab} onActiveTabChange={(tab) => setActiveTab(tab as "general" | "delivery")}>
          <Tabs.Item active title={t("settings.general")} id="general">
            <div className="space-y-4 mt-4">
              <div>
                <Label className="mb-2 block">{t("settings.isProduction")}</Label>
                <div dir="ltr" className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("is_production", settings["is_production"] === "1" ? "0" : "1")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      settings["is_production"] === "1" ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings["is_production"] === "1" ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <Label className="text-sm font-medium text-dark dark:text-white">
                    {settings["is_production"] === "1" ? t("settings.enabled") : t("settings.disabled")}
                  </Label>
                </div>
              </div>
              {generalSettings.map((setting) => (
                <div key={setting.key}>
                  <Label className="mb-2 block">{setting.label}</Label>
                  <TextInput
                    type={setting.type}
                    step={setting.step}
                    value={settings[setting.key] || ""}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    placeholder={setting.label}
                  />
                </div>
              ))}
            </div>
          </Tabs.Item>

          <Tabs.Item title={t("settings.delivery")} id="delivery">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {deliverySettings.map((setting) => (
                <div key={setting.key}>
                  <Label className="mb-2 block">{setting.label}</Label>
                  <TextInput
                    type={setting.type}
                    step={setting.step}
                    value={settings[setting.key] || ""}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    placeholder={setting.label}
                  />
                </div>
              ))}
            </div>
          </Tabs.Item>
        </Tabs>

        <div className="mt-6 pt-6 border-t border-ld flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={updating}
            className="bg-primary hover:bg-primary/90"
          >
            {updating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {t("settings.updating")}
              </>
            ) : (
              <>
                <Icon icon="solar:diskette-line-duotone" height={18} className="mr-2" />
                {t("settings.save")}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;

