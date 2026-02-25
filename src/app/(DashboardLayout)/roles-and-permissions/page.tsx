"use client";
import React, { useEffect, useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetRolesQuery, useDeleteRoleMutation } from "@/store/api/rolesApi";
import { useAppDispatch } from "@/store/hooks";
import { setRoles } from "@/store/slices/rolesSlice";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { useTranslation } from "react-i18next";

const RolesAndPermissions = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: rolesData, isLoading, error } = useGetRolesQuery({
    search: searchQuery,
    page: currentPage,
  });
  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number; name: string } | null>(null);

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (rolesData?.data) {
      dispatch(setRoles(rolesData.data));
    }
  }, [rolesData, dispatch]);

  const handleDeleteClick = (roleId: number, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const result = await deleteRole(roleToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setRoleToDelete(null);
        showNotification("success", t("roles.success"), t("roles.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setRoleToDelete(null);
      showNotification(
        "error",
        t("roles.error"),
        err?.data?.message || t("roles.deleteError")
      );
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setRoleToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("roles.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("roles.loadError")}</p>
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
            {t("roles.title")}
          </h1>
          <p className="text-sm text-ld mt-2">
            {t("roles.subtitle")}
          </p>
        </div>
        <Link href="/roles-and-permissions/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Icon icon="solar:add-circle-bold" height={20} />
            {t("roles.addNew")}
          </button>
        </Link>
      </div>

      {/* Search and Roles Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            {t("roles.allRoles")}
          </h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("roles.searchPlaceholder")}
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
                  {t("roles.roleName")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("roles.status")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("roles.createdAt")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("roles.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rolesData?.data?.map((role, index) => (
                <tr
                  key={role.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-dark dark:text-white">
                      {role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {role.is_active ? (
                      <Badge color="success" className="w-fit mx-auto">
                        {t("roles.active")}
                      </Badge>
                    ) : (
                      <Badge color="failure" className="w-fit mx-auto">
                        {t("roles.inactive")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70 text-center">
                    {new Date(role.created_at).toLocaleDateString(
                      i18n.language === "ar" ? "ar-EG" : "en-US",
                      {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/roles-and-permissions/edit/${role.id}`}>
                        <button
                          className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                          title={t("roles.edit")}
                        >
                          <Icon
                            icon="solar:pen-bold"
                            height={18}
                            className="text-primary"
                          />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(role.id, role.name)}
                        className="h-8 w-8 rounded-full hover:bg-lighterror dark:hover:bg-darkerror flex items-center justify-center transition-colors"
                        title={t("roles.delete")}
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

          {rolesData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon
                icon="solar:box-minimalistic-bold-duotone"
                height={64}
                className="text-ld mx-auto mb-4"
              />
              <p className="text-ld dark:text-white/70">{t("roles.noRoles")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {rolesData?.pagination && rolesData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("roles.showing", { from: rolesData.pagination.from, to: rolesData.pagination.to, total: rolesData.pagination.total })}
            </div>
            <Pagination
              currentPage={rolesData.pagination.current_page}
              totalPages={rolesData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel={t("roles.previous")}
              nextLabel={t("roles.next")}
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("roles.confirmDelete")}
        message={t("roles.deleteMessage", { name: roleToDelete?.name })}
        confirmText={t("roles.delete")}
        cancelText={t("roles.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default RolesAndPermissions;

