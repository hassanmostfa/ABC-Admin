"use client";

import React, { useState } from "react";
import { Card, Label, TextInput, Button, Spinner, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import { useCreateTeamMemberMutation } from "@/store/api/teamMembersApi";

const AddTeamMemberPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const router = useRouter();

  const [createMember, { isLoading }] = useCreateTeamMemberMutation();

  const [formData, setFormData] = useState({
    name: "",
    job_title: "",
    level: "1",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: t("teamMembers.invalidImageFormat") }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: t("teamMembers.imageSizeExceeded") }));
        return;
      }
      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = t("teamMembers.nameRequired");
    if (!formData.job_title.trim()) e.job_title = t("teamMembers.jobTitleRequired");
    if (!imageFile) e.image = t("teamMembers.imageRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMember({
        name: formData.name.trim(),
        image: imageFile!,
        job_title: formData.job_title.trim(),
        level: formData.level,
      }).unwrap();

      showNotification("success", t("teamMembers.success"), t("teamMembers.addSuccess"));
      router.push("/team-members");
    } catch (err: any) {
      showNotification("error", t("teamMembers.error"), err?.data?.message || t("teamMembers.addError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/team-members">
          <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
            <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("teamMembers.addTitle")}</h1>
          <p className="text-sm text-ld">{t("teamMembers.addSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <h2 className="text-xl font-semibold text-dark dark:text-white mb-4">{t("teamMembers.basicInfo")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="image" className="mb-2 block">{t("teamMembers.image")}</Label>
              <div className="flex items-center gap-6">
                <label
                  htmlFor="image"
                  className={`flex-1 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="border-2 border-dashed border-ld rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Icon icon="solar:cloud-upload-bold" height={32} className="text-ld mx-auto mb-2" />
                    <p className="text-sm text-ld mb-1">{t("teamMembers.clickToUpload")}</p>
                    <p className="text-xs text-ld">{t("teamMembers.imageFormats")}</p>
                  </div>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="hidden"
                  />
                </label>
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border border-ld">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isLoading}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90"
                      >
                        <Icon icon="solar:close-circle-bold" height={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-lightgray dark:bg-darkgray flex items-center justify-center border border-ld">
                      <Icon icon="solar:user-bold" height={32} className="text-ld" />
                    </div>
                  )}
                </div>
              </div>
              {errors.image ? <p className="mt-1 text-xs text-error">{errors.image}</p> : null}
            </div>

            <div>
              <Label htmlFor="name" className="mb-2 block">{t("teamMembers.name")}</Label>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder={t("teamMembers.namePlaceholder")}
              />
              {errors.name ? <p className="mt-1 text-xs text-error">{errors.name}</p> : null}
            </div>

            <div>
              <Label htmlFor="job_title" className="mb-2 block">{t("teamMembers.jobTitle")}</Label>
              <TextInput
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                required
                placeholder={t("teamMembers.jobTitlePlaceholder")}
              />
              {errors.job_title ? <p className="mt-1 text-xs text-error">{errors.job_title}</p> : null}
            </div>

            <div>
              <Label htmlFor="level" className="mb-2 block">{t("teamMembers.level")}</Label>
              <Select style={{ paddingRight: "30px" }} id="level" name="level" value={formData.level} onChange={handleInputChange}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" color="blue" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {t("teamMembers.save")}
            </Button>
            <Link href="/team-members">
              <Button type="button" color="gray">{t("teamMembers.cancel")}</Button>
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddTeamMemberPage;
