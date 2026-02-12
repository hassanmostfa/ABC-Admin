"use client";

import React, { useState } from "react";
import { Card, Button, Spinner, Badge, TextInput, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import { useDeleteFaqMutation, useGetFaqsQuery } from "@/store/api/faqsApi";

const FaqsPage = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<{ id: number; title: string } | null>(null);

  const { data: faqsData, isLoading, error } = useGetFaqsQuery({
    search: searchQuery || undefined,
    page: currentPage,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [deleteFaq, { isLoading: deleting }] = useDeleteFaqMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (id: number, title: string) => {
    setFaqToDelete({ id, title });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    try {
      const result = await deleteFaq(faqToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setFaqToDelete(null);
        showNotification("success", t("faqs.success"), t("faqs.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setFaqToDelete(null);
      showNotification("error", t("faqs.error"), err?.data?.message || t("faqs.deleteError"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setFaqToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-lighterror dark:bg-darkerror border-r-4 border-error rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
              <Icon icon="solar:danger-circle-bold" height={24} className="text-error" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">{t("faqs.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("faqs.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("faqs.title")}</h1>
          <p className="text-sm text-ld">{t("faqs.subtitle")}</p>
        </div>
        <HasPermission resource="faqs" action="add">
          <Link href="/faqs/add">
            <Button color="blue">
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              {t("faqs.addNew")}
            </Button>
          </Link>
        </HasPermission>
      </div>

      {/* FAQs Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("faqs.allFaqs")}</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("faqs.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("faqs.question")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("faqs.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("faqs.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("faqs.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {faqsData?.data?.map((faq, index) => {
                const primaryQ = i18n.language === "ar" ? (faq.question_ar || faq.question_en) : (faq.question_en || faq.question_ar);
                const secondaryQ = i18n.language === "ar" ? faq.question_en : faq.question_ar;
                return (
                  <tr key={faq.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                    <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                      {faqsData.pagination ? (faqsData.pagination.from + index) : (index + 1)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-dark dark:text-white line-clamp-2">{primaryQ || "-"}</div>
                      {secondaryQ ? <div className="text-xs text-ld dark:text-white/70 mt-1 line-clamp-1">{secondaryQ}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {faq.is_active ? (
                        <Badge color="success" className="w-fit mx-auto">{t("faqs.active")}</Badge>
                      ) : (
                        <Badge color="failure" className="w-fit mx-auto">{t("faqs.inactive")}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ld dark:text-white/70 text-center">{formatDate(faq.created_at)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <HasPermission resource="faqs" action="edit">
                          <Link href={`/faqs/edit/${faq.id}`}>
                            <button
                              className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                              title={t("faqs.edit")}
                            >
                              <Icon icon="solar:pen-bold" height={18} className="text-primary" />
                            </button>
                          </Link>
                        </HasPermission>
                        <HasPermission resource="faqs" action="delete">
                          <button
                            onClick={() => handleDeleteClick(faq.id, primaryQ || `FAQ #${faq.id}`)}
                            className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                            title={t("faqs.delete")}
                          >
                            <Icon icon="solar:trash-bin-minimalistic-bold" height={18} className="text-error" />
                          </button>
                        </HasPermission>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {faqsData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:question-circle-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("faqs.noFaqs")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {faqsData?.pagination && faqsData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("faqs.showing", { from: faqsData.pagination.from, to: faqsData.pagination.to, total: faqsData.pagination.total })}
            </div>
            <Pagination
              currentPage={faqsData.pagination.current_page}
              totalPages={faqsData.pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("faqs.previous")}
              nextLabel={t("faqs.next")}
            />
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("faqs.confirmDelete")}
        message={t("faqs.deleteMessage", { title: faqToDelete?.title })}
        confirmText={t("faqs.delete")}
        cancelText={t("faqs.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default FaqsPage;

