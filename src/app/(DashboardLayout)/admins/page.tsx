"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetAdminsQuery, useDeleteAdminMutation } from "@/store/api/adminsApi";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";

const AdminsPage = () => {
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
        showNotification("success", "نجاح!", "تم حذف المسؤول بنجاح");
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setAdminToDelete(null);
      showNotification(
        "error",
        "خطأ!",
        err?.data?.message || "حدث خطأ أثناء حذف المسؤول"
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
            <h3 className="text-lg font-semibold text-error mb-1">خطأ!</h3>
            <p className="text-sm text-dark dark:text-white">فشل في تحميل المسؤولين</p>
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
            المسؤولين
          </h1>
          <p className="text-sm text-ld mt-2">
            إدارة حسابات المسؤولين والمديرين
          </p>
        </div>
        <Link href="/admins/add">
          <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Icon icon="solar:add-circle-bold" height={20} />
            إضافة مسؤول جديد
          </button>
        </Link>
      </div>

      {/* Admins Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">
            جميع المسؤولين
          </h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder="ابحث عن مسؤول..."
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
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  #
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  الاسم
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  رقم الهاتف
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  الدور
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  الحالة
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {adminsData?.data?.map((admin, index) => (
                <tr
                  key={admin.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-dark dark:text-white">
                      {admin.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70">
                    {admin.phone}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color="info" className="w-fit">
                      {admin.role.name}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {admin.is_active ? (
                      <Badge color="success" className="w-fit">
                        نشط
                      </Badge>
                    ) : (
                      <Badge color="failure" className="w-fit">
                        غير نشط
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-ld dark:text-white/70">
                    {new Date(admin.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admins/edit/${admin.id}`}>
                        <button
                          className="h-8 w-8 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors"
                          title="تعديل"
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
                        title="حذف"
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
              <p className="text-ld dark:text-white/70">لا يوجد مسؤولين حتى الآن</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {adminsData?.pagination && adminsData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              عرض {adminsData.pagination.from} إلى {adminsData.pagination.to} من{" "}
              {adminsData.pagination.total} مسؤول
            </div>
            <Pagination
              currentPage={adminsData.pagination.current_page}
              totalPages={adminsData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel="السابق"
              nextLabel="التالي"
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المسؤول "${adminToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default AdminsPage;

