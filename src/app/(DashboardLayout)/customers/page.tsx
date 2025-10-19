"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCustomersQuery, useDeleteCustomerMutation } from "@/store/api/customersApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Link from "next/link";

const CustomersPage = () => {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: customersData, isLoading, error } = useGetCustomersQuery({
    search: searchQuery,
    page: currentPage,
  });
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: number; name: string } | null>(null);

  const onPageChange = (page: number) => setCurrentPage(page);

  const handleDeleteClick = (id: number, name: string) => {
    setCustomerToDelete({ id, name });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      const result = await deleteCustomer(customerToDelete.id).unwrap();
      if (result.success) {
        setShowConfirmModal(false);
        setCustomerToDelete(null);
        showNotification("success", "نجاح!", "تم حذف العميل بنجاح");
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setCustomerToDelete(null);
      showNotification("error", "خطأ!", err?.data?.message || "حدث خطأ أثناء حذف العميل");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setCustomerToDelete(null);
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
            <p className="text-sm text-dark dark:text-white">فشل في تحميل العملاء</p>
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
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">العملاء</h1>
          </div>
          <p className="text-sm text-ld mr-12">إدارة قائمة العملاء</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/customers/add">
            <Button color="primary" className="flex items-center gap-2">
              <Icon icon="solar:add-circle-bold" height={20} />
              إضافة عميل جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">جميع العملاء</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder="ابحث عن عميل..."
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
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">#</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الاسم</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">رقم الهاتف</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">البريد الإلكتروني</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الحالة</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">النقاط</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">تاريخ الإنشاء</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customersData?.data?.map((customer, index) => (
                <tr key={customer.id} className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors">
                  <td className="px-6 py-4 font-medium text-dark dark:text-white">{index + 1}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{customer.name}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{customer.phone}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">{customer.email}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {customer.is_active ? (
                      <Badge color="success" className="w-fit">نشط</Badge>
                    ) : (
                      <Badge color="failure" className="w-fit">غير نشط</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">{customer.points}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {new Date(customer.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/edit/${customer.id}`}>
                        <button className="text-primary hover:text-primary/80 transition-colors" title="تعديل">
                          <Icon icon="solar:pen-bold" height={18} />
                        </button>
                      </Link>
                      <button 
                        className="text-error hover:text-error/80 transition-colors" 
                        title="حذف"
                        onClick={() => handleDeleteClick(customer.id, customer.name)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" height={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customersData?.data?.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:users-group-two-rounded-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">لا يوجد عملاء حتى الآن</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {customersData?.pagination && customersData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              عرض {customersData.pagination.from} إلى {customersData.pagination.to} من {customersData.pagination.total} عميل
            </div>
            <Pagination
              currentPage={customersData.pagination.current_page}
              totalPages={customersData.pagination.last_page}
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
        message={`هل أنت متأكد من حذف العميل "${customerToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CustomersPage;
