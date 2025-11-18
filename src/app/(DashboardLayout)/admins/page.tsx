"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetAdminsQuery, useDeleteAdminMutation } from "@/store/api/adminsApi";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTranslation } from "react-i18next";

const AdminsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: adminsData, isLoading, error } = useGetAdminsQuery({
    search: searchQuery,
    page: currentPage,
  });
  const [deleteAdmin, { isLoading: deleting }] = useDeleteAdminMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{ id: number; name: string } | null>(null);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (adminId: number, adminName: string) => {
    setAdminToDelete({ id: adminId, name: adminName });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      const result = await deleteAdmin(adminToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setAdminToDelete(null);
        showNotification("success", t("admins.success"), t("admins.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setAdminToDelete(null);
      showNotification(
        "error",
        t("admins.error"),
        err?.data?.message || t("admins.deleteError")
      );
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setAdminToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("admins.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("admins.loadError")}</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            {t("admins.title")}
          </h1>
          <p className="text-sm text-ld mt-2">
            {t("admins.subtitle")}
          </p>
        </div>
        <Link href="/admins/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Icon icon="solar:add-circle-bold" height={20} />
            {t("admins.addNew")}
          </button>
        </Link>
      </div>

      {/* Admins Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            {t("admins.allAdmins")}
          </h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("admins.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  #
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.name")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.email")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.phone")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.role")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.status")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.createdAt")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("admins.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {adminsData?.data?.map((admin, index) => (
                <tr
                  key={admin.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-dark dark:text-white">
                      {admin.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70 text-center">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70 text-center">
                    {admin.phone}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color="info" className="w-fit mx-auto">
                      {admin.role.name}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {admin.is_active ? (
                      <Badge color="success" className="w-fit mx-auto">
                        {t("admins.active")}
                      </Badge>
                    ) : (
                      <Badge color="failure" className="w-fit mx-auto">
                        {t("admins.inactive")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70 text-center">
                    {new Date(admin.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admins/edit/${admin.id}`}>
                        <button
                          className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                          title={t("admins.edit")}
                        >
                          <Icon
                            icon="solar:pen-bold"
                            height={18}
                            className="text-primary"
                          />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(admin.id, admin.name)}
                        className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                        title={t("admins.delete")}
                      >
                        <Icon
                          icon="solar:trash-bin-minimalistic-bold"
                          height={18}
                          className="text-error"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {adminsData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon
                icon="solar:user-bold-duotone"
                height={64}
                className="text-ld mx-auto mb-4"
              />
              <p className="text-ld dark:text-white/70">{t("admins.noAdmins")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {adminsData?.pagination && adminsData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("admins.showing", { from: adminsData.pagination.from, to: adminsData.pagination.to, total: adminsData.pagination.total })}
            </div>
            <Pagination
              currentPage={adminsData.pagination.current_page}
              totalPages={adminsData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel={t("admins.previous")}
              nextLabel={t("admins.next")}
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("admins.confirmDelete")}
        message={t("admins.deleteMessage", { name: adminToDelete?.name })}
        confirmText={t("admins.delete")}
        cancelText={t("admins.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default AdminsPage;

