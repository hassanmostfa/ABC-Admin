"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetSocialMediaLinksQuery, useDeleteSocialMediaLinkMutation } from "@/store/api/socialMediaLinksApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import { useTranslation } from "react-i18next";

const SocialMediaLinksPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<{ id: number; title: string } | null>(null);

  const [deleteLink, { isLoading: deleting }] = useDeleteSocialMediaLinkMutation();

  const { data: linksData, isLoading, error } = useGetSocialMediaLinksQuery({
    search: searchQuery,
    page: currentPage,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (id: number, title: string) => {
    setLinkToDelete({ id, title });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    try {
      const result = await deleteLink(linkToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setLinkToDelete(null);
        showNotification("success", t("socialMediaLinks.success"), t("socialMediaLinks.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setLinkToDelete(null);
      showNotification("error", t("socialMediaLinks.error"), err?.data?.message || t("socialMediaLinks.deleteError"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setLinkToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("socialMediaLinks.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("socialMediaLinks.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("socialMediaLinks.title")}</h1>
          <p className="text-sm text-ld">{t("socialMediaLinks.subtitle")}</p>
        </div>
        <HasPermission resource="social_media_links" action="add">
          <Link href="/social-media-links/add">
            <Button color="blue">
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              {t("socialMediaLinks.addNew")}
            </Button>
          </Link>
        </HasPermission>
      </div>

      {/* Social Media Links Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("socialMediaLinks.allLinks")}</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("socialMediaLinks.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.icon")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.nameAr")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.nameEn")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.url")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("socialMediaLinks.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {linksData?.data?.map((link, index) => (
                <tr key={link.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {linksData.pagination ? (linksData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                      <img 
                        src={link.icon_url} 
                        alt={link.title_ar || link.title_en || t("socialMediaLinks.icon")}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/defaults/no-image.png';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {link.title_ar || t("socialMediaLinks.notSpecified")}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {link.title_en || t("socialMediaLinks.notSpecified")}
                  </td>
                  <td className="px-6 py-4 max-w-xs text-center">
                    <div className="truncate text-dark dark:text-white" title={link.url}>
                      {link.url}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color={link.is_active ? "green" : "gray"}>
                      {link.is_active ? t("socialMediaLinks.active") : t("socialMediaLinks.inactive")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {formatDate(link.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <HasPermission resource="social_media_links" action="edit">
                        <Link href={`/social-media-links/edit/${link.id}`}>
                          <button className="text-primary hover:text-primary/80 transition-colors" title={t("socialMediaLinks.edit")}>
                            <Icon icon="solar:pen-bold" height={18} />
                          </button>
                        </Link>
                      </HasPermission>
                      <HasPermission resource="social_media_links" action="delete">
                        <button 
                          className="text-error hover:text-error/80 transition-colors" 
                          title={t("socialMediaLinks.delete")}
                          onClick={() => handleDeleteClick(link.id, link.title_ar || link.title_en || t("socialMediaLinks.url"))}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" height={18} />
                        </button>
                      </HasPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!linksData?.data || linksData.data.length === 0) && (
            <div className="text-center py-12">
              <Icon icon="solar:link-bold" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("socialMediaLinks.noLinks")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {linksData?.pagination && linksData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("socialMediaLinks.showing", { from: linksData.pagination.from, to: linksData.pagination.to, total: linksData.pagination.total })}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                {t("socialMediaLinks.previous")}
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {t("socialMediaLinks.page")} {currentPage} {t("socialMediaLinks.of")} {linksData.pagination.last_page}
              </span>
              
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === linksData.pagination.last_page}
              >
                {t("socialMediaLinks.next")}
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("socialMediaLinks.confirmDelete")}
        message={t("socialMediaLinks.deleteMessage", { title: linkToDelete?.title || "" })}
        confirmText={t("socialMediaLinks.delete")}
        cancelText={t("socialMediaLinks.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default SocialMediaLinksPage;
