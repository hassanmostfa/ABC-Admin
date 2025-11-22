"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCareerApplicationsQuery, useDeleteCareerApplicationMutation } from "@/store/api/careersApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTranslation } from "react-i18next";

const CareersPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<{ id: number; name: string } | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<{ name: string; message: string } | null>(null);

  const [deleteApplication, { isLoading: deleting }] = useDeleteCareerApplicationMutation();

  const { data: careersData, isLoading, error } = useGetCareerApplicationsQuery({
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

  const handleDeleteClick = (id: number, name: string) => {
    setApplicationToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;
    try {
      const result = await deleteApplication(applicationToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setApplicationToDelete(null);
        showNotification("success", t("careers.success"), t("careers.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setApplicationToDelete(null);
      showNotification("error", t("careers.error"), err?.data?.message || t("careers.deleteError"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setApplicationToDelete(null);
  };

  const handleShowMessage = (name: string, message: string) => {
    setSelectedMessage({ name, message });
    setShowMessageModal(true);
  };

  const handleCloseMessage = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("careers.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("careers.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("careers.title")}</h1>
          <p className="text-sm text-ld">{t("careers.subtitle")}</p>
        </div>
      </div>

      {/* Career Applications Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("careers.allApplications")}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.name")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.email")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.phone")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.position")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.attachedFile")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.applicationDate")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">{t("careers.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {careersData?.data?.map((application, index) => (
                <tr key={application.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {careersData.pagination ? (careersData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {application.name}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {application.email}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {application.phone}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color="blue" className="w-fit mx-auto">{application.applying_position}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => downloadFile(application.file_url, application.file_name)}
                      className="w-fit mx-auto text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-2 justify-center"
                      title={t("careers.downloadFile")}
                    >
                      <Icon icon="solar:download-minimalistic-bold" height={18} className="w-fit mx-auto" />
                      <span className="text-sm w-fit mx-auto truncate max-w-[150px]">{application.file_name}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {formatDate(application.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <button 
                        className="text-primary hover:text-primary/80 transition-colors" 
                        title={t("careers.viewMessage")}
                        onClick={() => handleShowMessage(application.name, application.message)}
                      >
                        <Icon icon="solar:eye-bold" height={18} />
                      </button>
                      <button 
                        className="text-error hover:text-error/80 transition-colors" 
                        title={t("careers.delete")}
                        onClick={() => handleDeleteClick(application.id, application.name)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!careersData?.data || careersData.data.length === 0) && (
            <div className="text-center py-12">
              <Icon icon="solar:case-bold" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("careers.noApplications")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {careersData?.pagination && careersData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("careers.showing", { from: careersData.pagination.from, to: careersData.pagination.to, total: careersData.pagination.total })}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                {t("careers.previous")}
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {t("careers.page")} {currentPage} {t("careers.of")} {careersData.pagination.last_page}
              </span>
              
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === careersData.pagination.last_page}
              >
                {t("careers.next")}
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                {t("careers.messageFrom", { name: selectedMessage.name })}
              </h3>
              <button
                onClick={handleCloseMessage}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon icon="solar:close-circle-bold" height={24} />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCloseMessage}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t("careers.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("careers.confirmDelete")}
        message={t("careers.deleteMessage", { name: applicationToDelete?.name || "" })}
        confirmText={t("careers.delete")}
        cancelText={t("careers.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CareersPage;