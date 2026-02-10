"use client";

import React, { useState } from "react";
import { Card, Label, TextInput, Button, Spinner, ToggleSwitch, Textarea } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import { useCreateFaqMutation } from "@/store/api/faqsApi";

const AddFaqPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const router = useRouter();

  const [createFaq, { isLoading }] = useCreateFaqMutation();

  const [formData, setFormData] = useState({
    question_en: "",
    question_ar: "",
    answer_en: "",
    answer_ar: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.question_en.trim()) e.question_en = t("faqs.questionEnRequired");
    if (!formData.question_ar.trim()) e.question_ar = t("faqs.questionArRequired");
    if (!formData.answer_en.trim()) e.answer_en = t("faqs.answerEnRequired");
    if (!formData.answer_ar.trim()) e.answer_ar = t("faqs.answerArRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      await createFaq({
        question_en: formData.question_en.trim(),
        question_ar: formData.question_ar.trim(),
        answer_en: formData.answer_en.trim(),
        answer_ar: formData.answer_ar.trim(),
        is_active: formData.is_active,
      }).unwrap();

      showNotification("success", t("faqs.success"), t("faqs.addSuccess"));
      router.push("/faqs");
    } catch (err: any) {
      showNotification("error", t("faqs.error"), err?.data?.message || t("faqs.addError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("faqs.addTitle")}</h1>
          <p className="text-sm text-ld">{t("faqs.addSubtitle")}</p>
        </div>
        <Link href="/faqs">
          <Button color="gray">
            <Icon icon="solar:arrow-right-bold" height={18} className="ml-1" />
            {t("faqs.back")}
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">{t("faqs.questionEn")}</Label>
              <TextInput
                name="question_en"
                value={formData.question_en}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, question_en: e.target.value }));
                  if (errors.question_en) setErrors((p) => ({ ...p, question_en: "" }));
                }}
                color={errors.question_en ? "failure" : "gray"}
              />
              {errors.question_en ? <p className="text-xs text-error mt-1">{errors.question_en}</p> : null}
            </div>

            <div>
              <Label className="mb-2 block">{t("faqs.questionAr")}</Label>
              <TextInput
                name="question_ar"
                value={formData.question_ar}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, question_ar: e.target.value }));
                  if (errors.question_ar) setErrors((p) => ({ ...p, question_ar: "" }));
                }}
                color={errors.question_ar ? "failure" : "gray"}
              />
              {errors.question_ar ? <p className="text-xs text-error mt-1">{errors.question_ar}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <Label className="mb-2 block">{t("faqs.answerEn")}</Label>
              <Textarea
                rows={5}
                value={formData.answer_en}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, answer_en: e.target.value }));
                  if (errors.answer_en) setErrors((p) => ({ ...p, answer_en: "" }));
                }}
                color={errors.answer_en ? "failure" : "gray"}
              />
              {errors.answer_en ? <p className="text-xs text-error mt-1">{errors.answer_en}</p> : null}
            </div>

            <div className="lg:col-span-2">
              <Label className="mb-2 block">{t("faqs.answerAr")}</Label>
              <Textarea
                rows={5}
                value={formData.answer_ar}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, answer_ar: e.target.value }));
                  if (errors.answer_ar) setErrors((p) => ({ ...p, answer_ar: "" }));
                }}
                color={errors.answer_ar ? "failure" : "gray"}
              />
              {errors.answer_ar ? <p className="text-xs text-error mt-1">{errors.answer_ar}</p> : null}
            </div>

            <div className="lg:col-span-2 flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <Icon icon="solar:check-circle-bold" height={18} className="text-primary" />
                <span className="text-sm text-dark dark:text-white">{t("faqs.isActive")}</span>
              </div>
              <ToggleSwitch
                checked={formData.is_active}
                label={formData.is_active ? t("faqs.active") : t("faqs.inactive")}
                onChange={(v) => setFormData((p) => ({ ...p, is_active: v }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-ld">
            <Link href="/faqs">
              <Button color="gray" type="button">
                {t("faqs.cancel")}
              </Button>
            </Link>
            <Button type="submit" color="blue" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  {t("faqs.saving")}
                </>
              ) : (
                t("faqs.save")
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default AddFaqPage;

