"use client";

import React, { useState } from "react";
import { Card, Button, Spinner, Badge, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import {
  useGetTeamMembersQuery,
  useDeleteTeamMemberMutation,
  TeamMember,
} from "@/store/api/teamMembersApi";
import { useNotification } from "@/app/context/NotificationContext";
import Link from "next/link";
import ConfirmModal from "@/components/shared/ConfirmModal";
import HasPermission from "@/components/shared/HasPermission";
import { useTranslation } from "react-i18next";

const TeamMembersPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: number; name: string } | null>(null);

  const [deleteMember, { isLoading: deleting }] = useDeleteTeamMemberMutation();

  const { data, isLoading, error } = useGetTeamMembersQuery({
    page: currentPage,
    per_page: 15,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (id: number, name: string) => {
    setMemberToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      const result = await deleteMember(memberToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setMemberToDelete(null);
        showNotification("success", t("teamMembers.success"), t("teamMembers.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setMemberToDelete(null);
      showNotification(
        "error",
        t("teamMembers.error"),
        err?.data?.message || t("teamMembers.deleteError")
      );
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setMemberToDelete(null);
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("teamMembers.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("teamMembers.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  const members = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">
            {t("teamMembers.title")}
          </h1>
          <p className="text-sm text-ld">{t("teamMembers.subtitle")}</p>
        </div>
        <HasPermission resource="team_members" action="add">
          <Link href="/team-members/add">
            <Button color="blue">
              <Icon icon="solar:add-circle-bold" height={16} className="ml-1" />
              {t("teamMembers.addNew")}
            </Button>
          </Link>
        </HasPermission>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-dark dark:text-white mb-6">
          {t("teamMembers.allMembers")}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.image")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.name")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.jobTitle")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.level")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.createdAt")}
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white text-center">
                  {t("teamMembers.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-dark dark:text-white text-center">
                    {pagination ? pagination.from + index : index + 1}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/defaults/no-image.png";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {member.job_title}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge color="blue">{member.level}</Badge>
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white text-center">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center gap-4 justify-center">
                      <HasPermission resource="team_members" action="edit">
                        <Link href={`/team-members/edit/${member.id}`}>
                          <button
                            className="text-primary hover:text-primary/80 transition-colors"
                            title={t("teamMembers.edit")}
                          >
                            <Icon icon="solar:pen-bold" height={18} />
                          </button>
                        </Link>
                      </HasPermission>
                      <HasPermission resource="team_members" action="delete">
                        <button
                          className="text-error hover:text-error/80 transition-colors"
                          title={t("teamMembers.delete")}
                          onClick={() => handleDeleteClick(member.id, member.name)}
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

          {members.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:users-group-rounded-line-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("teamMembers.noMembers")}</p>
            </div>
          )}
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("teamMembers.showing", {
                from: pagination.from,
                to: pagination.to,
                total: pagination.total,
              })}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                {t("teamMembers.previous")}
              </Button>
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                {t("teamMembers.page")} {currentPage} {t("teamMembers.of")} {pagination.last_page}
              </span>
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
              >
                {t("teamMembers.next")}
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("teamMembers.confirmDelete")}
        message={t("teamMembers.deleteMessage", { name: memberToDelete?.name || "" })}
        confirmText={t("teamMembers.delete")}
        cancelText={t("teamMembers.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default TeamMembersPage;
