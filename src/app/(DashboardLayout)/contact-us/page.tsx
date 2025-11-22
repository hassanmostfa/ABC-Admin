"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetContactMessagesQuery, useMarkContactAsReadMutation, useDeleteContactMessageMutation } from "@/store/api/contactUsApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTranslation } from "react-i18next";

const ContactUsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);

  const [markAsRead, { isLoading: markingAsRead }] = useMarkContactAsReadMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMessageMutation();

  const { data: contactData, isLoading, error } = useGetContactMessagesQuery({
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

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
      showNotification("success", t("contactUs.success"), t("contactUs.markAsReadSuccess"));
    } catch (err: any) {
      showNotification("error", t("contactUs.error"), err?.data?.message || t("contactUs.markAsReadError"));
    }
  };

  const handleDeleteClick = (id: number) => {
    setContactToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    
    try {
      await deleteContact(contactToDelete).unwrap();
      showNotification("success", t("contactUs.success"), t("contactUs.deleteSuccess"));
      setShowDeleteModal(false);
      setContactToDelete(null);
    } catch (err: any) {
      showNotification("error", t("contactUs.error"), err?.data?.message || t("contactUs.deleteError"));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("contactUs.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("contactUs.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("contactUs.title")}</h1>
          <p className="text-sm text-ld">{t("contactUs.subtitle")}</p>
        </div>
      </div>

      {/* Contact Messages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.name")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.email")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.message")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.sendDate")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("contactUs.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {contactData?.data?.map((contact, index) => (
                <tr key={contact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-center">
                    {contactData.pagination ? (contactData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-center">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-center">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 max-w-xs text-center">
                    <div className="truncate text-gray-600 dark:text-gray-400" title={contact.message}>
                      {contact.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {!contact.is_read && (
                        <Badge color="blue">{t("contactUs.new")}</Badge>
                      )}
                      <Badge color={contact.is_read ? "green" : "gray"}>
                        {contact.is_read ? t("contactUs.read") : t("contactUs.unread")}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-center">
                    {formatDate(contact.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {!contact.is_read && (
                        <Button 
                          size="sm" 
                          color="green"
                          onClick={() => handleMarkAsRead(contact.id)}
                          disabled={markingAsRead}
                          title={t("contactUs.markAsRead")}
                        >
                          <Icon icon="solar:check-circle-bold" height={16} />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        color="red"
                        onClick={() => handleDeleteClick(contact.id)}
                        disabled={deleting}
                        title={t("contactUs.delete")}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!contactData?.data || contactData.data.length === 0) && (
            <div className="text-center py-12">
              <Icon icon="solar:letter-bold" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("contactUs.noMessages")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {contactData?.pagination && contactData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("contactUs.showing", { from: contactData.pagination.from, to: contactData.pagination.to, total: contactData.pagination.total })}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                {t("contactUs.previous")}
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {t("contactUs.page")} {currentPage} {t("contactUs.of")} {contactData.pagination.last_page}
              </span>
              
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === contactData.pagination.last_page}
              >
                {t("contactUs.next")}
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t("contactUs.confirmDelete")}
        message={t("contactUs.deleteMessage")}
        confirmText={t("contactUs.delete")}
        cancelText={t("contactUs.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ContactUsPage;
