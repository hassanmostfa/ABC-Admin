"use client";
import React, { useState } from "react";
import { Card, Badge, Spinner, TextInput, Pagination, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetCustomersQuery, useDeleteCustomerMutation } from "@/store/api/customersApi";
import { useNotification } from "@/app/context/NotificationContext";
import ConfirmModal from "@/components/shared/ConfirmModal";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const CustomersPage = () => {
  const { t, i18n } = useTranslation();
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
        showNotification("success", t("customers.success"), t("customers.deleteSuccess"));
      }
    } catch (err: any) {
      setShowConfirmModal(false);
      setCustomerToDelete(null);
      showNotification("error", t("customers.error"), err?.data?.message || t("customers.deleteError"));
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
            <h3 className="text-lg font-semibold text-error mb-1">{t("customers.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("customers.loadError")}</p>
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
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("customers.title")}</h1>
          </div>
          <p className="text-sm text-ld mr-12">{t("customers.subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/customers/add">
            <Button color="primary" className="flex items-center gap-2">
              <Icon icon="solar:add-circle-bold" height={20} />
              {t("customers.addNew")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-dark dark:text-white">{t("customers.allCustomers")}</h2>
          <div className="relative w-80">
            <TextInput
              icon={() => <Icon icon="solar:magnifer-linear" height={20} />}
              placeholder={t("customers.searchPlaceholder")}
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
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.name")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.phone")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.email")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.status")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.points")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.createdAt")}</th>
                <th className="px-6 py-3 font-semibold text-dark dark:text-white">{t("customers.actions")}</th>
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
                      <Badge color="success" className="w-fit">{t("customers.active")}</Badge>
                    ) : (
                      <Badge color="failure" className="w-fit">{t("customers.inactive")}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark dark:text-white">{customer.points}</td>
                  <td className="px-6 py-4 text-dark dark:text-white">
                    {new Date(customer.created_at).toLocaleDateString(
                      i18n.language === "ar" ? "ar-EG" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/customers/edit/${customer.id}`}>
                        <button className="text-primary hover:text-primary/80 transition-colors" title={t("customers.edit")}>
                          <Icon icon="solar:pen-bold" height={18} />
                        </button>
                      </Link>
                      <button 
                        className="text-error hover:text-error/80 transition-colors" 
                        title={t("customers.delete")}
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
              <p className="text-ld dark:text-white/70">{t("customers.noCustomers")}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {customersData?.pagination && customersData.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("customers.showing", { from: customersData.pagination.from, to: customersData.pagination.to, total: customersData.pagination.total })}
            </div>
            <Pagination
              currentPage={customersData.pagination.current_page}
              totalPages={customersData.pagination.last_page}
              onPageChange={onPageChange}
              showIcons
              previousLabel={t("customers.previous")}
              nextLabel={t("customers.next")}
            />
          </div>
        )}
      </Card>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={t("customers.confirmDelete")}
        message={t("customers.deleteMessage", { name: customerToDelete?.name })}
        confirmText={t("customers.delete")}
        cancelText={t("customers.cancel")}
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
};

export default CustomersPage;
