"use client";
import React, { use } from "react";
import { Card, Badge, Spinner, Button, Select } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "@/store/api/ordersApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";

interface OrderShowProps {
  params: Promise<{ id: string }>;
}

const OrderShow = ({ params }: OrderShowProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { showNotification } = useNotification();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);
  const { data: orderData, isLoading, error } = useGetOrderByIdQuery(orderId);
  const [updateOrderStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: "success" | "failure" | "warning" | "info"; label: string }> = {
      pending: { color: "warning", label: t("orders.status.pending") },
      processing: { color: "info", label: t("orders.status.processing") },
      completed: { color: "success", label: t("orders.status.completed") },
      cancelled: { color: "failure", label: t("orders.status.cancelled") },
    };

    const config = statusConfig[status] || { color: "info", label: status };
    return (
      <Badge color={config.color} className="w-fit">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: t("orders.paymentMethod.cash"),
      wallet: t("orders.paymentMethod.wallet"),
      card: t("orders.paymentMethod.card"),
    };
    return methods[method] || method;
  };

  const getDeliveryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      pickup: t("orders.deliveryType.pickup"),
      delivery: t("orders.deliveryType.delivery"),
    };
    return types[type] || type;
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus }).unwrap();
      showNotification("success", t("orders.success"), t("orders.statusUpdated"));
    } catch (err: any) {
      showNotification("error", t("orders.error"), err?.data?.message || t("orders.updateError"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !orderData?.data) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Icon icon="solar:danger-circle-bold" height={64} className="text-error mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">{t("orders.orderNotFound")}</h2>
        <p className="text-ld mb-6">{t("orders.orderNotFoundDescription")}</p>
        <Link href="/orders">
          <Button color="primary">
            <Icon icon="solar:arrow-right-bold" height={20} className="ml-2" />
            {t("orders.backToOrders")}
          </Button>
        </Link>
      </div>
    );
  }

  const order = orderData.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/orders">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("orders.orderDetails")}</h1>
          </div>
          <p className="text-sm text-ld mr-12">{order.order_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-80"
            icon={() => <Icon icon="solar:arrow-down-bold" height={20} />}
            disabled={updating}
            style={{ direction: i18n.language === "ar" ? "ltr" : "ltr" }}
          >
            <option value="pending">{t("orders.status.pending")}</option>
            <option value="processing">{t("orders.status.processing")}</option>
            <option value="completed">{t("orders.status.completed")}</option>
            <option value="cancelled">{t("orders.status.cancelled")}</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.orderInformation")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.orderNumber")}</label>
                <p className="font-medium text-dark dark:text-white">{order.order_number}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.status")}</label>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.paymentMethod")}</label>
                <p className="font-medium text-dark dark:text-white">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryType")}</label>
                <p className="font-medium text-dark dark:text-white">{getDeliveryTypeLabel(order.delivery_type)}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.createdAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatDateTime(order.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.updatedAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatDateTime(order.updated_at)}</p>
              </div>
            </div>
          </Card>

          {/* Customer/Charity Information */}
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">
              {order.type === "customer" ? t("orders.customer") : t("orders.charity")}
            </h2>
            {order.type === "customer" && order.customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.name")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.phone")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.customer.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.email")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.customer.email}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.points")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.customer.points}</p>
                </div>
              </div>
            ) : order.type === "charity" && order.charity ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.nameAr")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.charity.name_ar}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.nameEn")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.charity.name_en}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.phone")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.charity.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-ld dark:text-white/70">-</p>
            )}
          </Card>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.orderItems")}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.product")}</th>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.sku")}</th>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.quantity")}</th>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.unitPrice")}</th>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.totalPrice")}</th>
                      <th className="px-4 py-3 font-semibold text-dark dark:text-white text-right">{t("orders.isOffer")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-ld">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-dark dark:text-white">{item.name}</p>
                            <p className="text-xs text-ld dark:text-white/70">
                              {item.product_variant.product_name_ar} - {item.product_variant.variant_size}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-dark dark:text-white font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 text-dark dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-dark dark:text-white">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-dark dark:text-white font-semibold">{formatCurrency(item.total_price)}</td>
                        <td className="px-4 py-3">
                          {item.is_offer ? (
                            <Badge color="success" className="w-fit">{t("orders.yes")}</Badge>
                          ) : (
                            <Badge color="gray" className="w-fit">{t("orders.no")}</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Delivery Information */}
          {order.delivery && (
            <Card>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.deliveryInformation")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryAddress")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.delivery_address}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.block")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.block}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.street")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.street}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.houseNumber")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.house_number}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryDateTime")}</label>
                  <p className="font-medium text-dark dark:text-white">{formatDateTime(order.delivery.delivery_datetime)}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryStatus")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.delivery_status}</p>
                </div>
                {order.delivery.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-ld dark:text-white/70">{t("orders.notes")}</label>
                    <p className="font-medium text-dark dark:text-white">{order.delivery.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          {order.invoice && (
            <Card>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.invoice")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.invoiceNumber")}</span>
                  <span className="font-medium text-dark dark:text-white">{order.invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.totalBeforeDiscounts")}</span>
                  <span className="font-medium text-dark dark:text-white">{formatCurrency(order.invoice.total_before_discounts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.taxAmount")}</span>
                  <span className="font-medium text-dark dark:text-white">{formatCurrency(order.invoice.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.offerDiscount")}</span>
                  <span className="font-medium text-dark dark:text-white text-success">-{formatCurrency(order.invoice.offer_discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.pointsDiscount")}</span>
                  <span className="font-medium text-dark dark:text-white text-success">-{formatCurrency(order.invoice.points_discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.totalDiscount")}</span>
                  <span className="font-medium text-dark dark:text-white text-success">-{formatCurrency(order.invoice.total_discount)}</span>
                </div>
                <div className="border-t border-ld pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-dark dark:text-white">{t("orders.amountDue")}</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(order.invoice.amount_due)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.invoiceStatus")}</span>
                  <Badge color={order.invoice.status === "paid" ? "success" : "warning"} className="w-fit">
                    {order.invoice.status}
                  </Badge>
                </div>
                {order.invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.paidAt")}</span>
                    <span className="font-medium text-dark dark:text-white">{formatDateTime(order.invoice.paid_at)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Offer Information */}
          {order.offer && (
            <Card>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.offer")}</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.rewardType")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.offer.reward_type}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.points")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.offer.points}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.offerStartDate")}</label>
                  <p className="font-medium text-dark dark:text-white">{formatDate(order.offer.offer_start_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.offerEndDate")}</label>
                  <p className="font-medium text-dark dark:text-white">{formatDate(order.offer.offer_end_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.isActive")}</label>
                  <div className="mt-1">
                    <Badge color={order.offer.is_active ? "success" : "failure"} className="w-fit">
                      {order.offer.is_active ? t("orders.yes") : t("orders.no")}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderShow;

