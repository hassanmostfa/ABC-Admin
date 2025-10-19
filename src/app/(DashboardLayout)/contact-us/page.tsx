"use client";
import React, { useState } from "react";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetContactMessagesQuery, useMarkContactAsReadMutation, useDeleteContactMessageMutation } from "@/store/api/contactUsApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";

const ContactUsPage = () => {
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
      showNotification("success", "نجح!", "تم تمييز الرسالة كمقروءة");
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "فشل في تمييز الرسالة كمقروءة");
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
      showNotification("success", "نجح!", "تم حذف الرسالة بنجاح");
      setShowDeleteModal(false);
      setContactToDelete(null);
    } catch (err: any) {
      showNotification("error", "خطأ!", err?.data?.message || "فشل في حذف الرسالة");
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
            <h3 className="text-lg font-semibold text-error mb-1">خطأ!</h3>
            <p className="text-sm text-dark dark:text-white">فشل في تحميل رسائل التواصل</p>
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
          <h1 className="text-3xl font-bold text-dark dark:text-white">رسائل التواصل</h1>
          <p className="text-sm text-ld">عرض وإدارة جميع رسائل التواصل</p>
        </div>
      </div>

      {/* Contact Messages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">البريد الإلكتروني</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الرسالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الحالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">تاريخ الإرسال</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {contactData?.data?.map((contact, index) => (
                <tr key={contact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {contactData.pagination ? (contactData.pagination.from + index) : (index + 1)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="truncate text-gray-600 dark:text-gray-400" title={contact.message}>
                      {contact.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!contact.is_read && (
                        <Badge color="blue">جديد</Badge>
                      )}
                      <Badge color={contact.is_read ? "green" : "gray"}>
                        {contact.is_read ? "مقروءة" : "غير مقروءة"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {formatDate(contact.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!contact.is_read && (
                        <Button 
                          size="sm" 
                          color="green"
                          onClick={() => handleMarkAsRead(contact.id)}
                          disabled={markingAsRead}
                        >
                          <Icon icon="solar:check-circle-bold" height={16} />
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        color="red"
                        onClick={() => handleDeleteClick(contact.id)}
                        disabled={deleting}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {contactData?.pagination && contactData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {contactData.pagination.from} إلى {contactData.pagination.to} من {contactData.pagination.total} رسالة
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon icon="solar:alt-arrow-right-bold" height={16} />
                السابق
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                صفحة {currentPage} من {contactData.pagination.last_page}
              </span>
              
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === contactData.pagination.last_page}
              >
                التالي
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
        title="حذف الرسالة"
        message="هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default ContactUsPage;
