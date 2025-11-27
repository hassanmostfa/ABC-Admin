"use client";
import React, { use } from "react";
import { Card, Badge, Spinner, Button } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetInvoiceByIdQuery } from "@/store/api/invoicesApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface InvoiceShowProps {
  params: Promise<{ id: string }>;
}

const InvoiceShow = ({ params }: InvoiceShowProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const resolvedParams = use(params);
  const invoiceId = parseInt(resolvedParams.id);
  const { data: invoiceData, isLoading, error } = useGetInvoiceByIdQuery(invoiceId);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: "success" | "failure" | "warning" | "info"; label: string }> = {
      pending: { color: "warning", label: t("invoices.status.pending") },
      paid: { color: "success", label: t("invoices.status.paid") },
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
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
      minimumFractionDigits: 3,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !invoiceData?.data) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Icon icon="solar:danger-circle-bold" height={64} className="text-error mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">{t("invoices.invoiceNotFound")}</h2>
        <p className="text-ld mb-6">{t("invoices.invoiceNotFoundDescription")}</p>
        <Link href="/invoices">
          <Button color="primary">
            <Icon icon="solar:arrow-right-bold" height={20} className="ml-2" />
            {t("invoices.backToInvoices")}
          </Button>
        </Link>
      </div>
    );
  }

  const invoice = invoiceData.data;
  const order = invoice.order;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/invoices">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">{t("invoices.invoiceDetails")}</h1>
          </div>
          <p className="text-sm text-ld mr-12">{invoice.invoice_number}</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("invoices.invoiceInformation")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("invoices.invoiceNumber")}</label>
                <p className="font-medium text-dark dark:text-white font-mono">{invoice.invoice_number}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("invoices.status")}</label>
                <div className="mt-1">{getStatusBadge(invoice.status)}</div>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("invoices.orderNumber")}</label>
                <p className="font-medium text-dark dark:text-white">
                  <Link href={`/orders/show/${invoice.order_id}`} className="text-primary hover:underline font-mono">
                    {order.order_number}
                  </Link>
                </p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("invoices.createdAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatDateTime(invoice.created_at)}</p>
              </div>
              {invoice.paid_at && (
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("invoices.paidAt")}</label>
                  <p className="font-medium text-dark dark:text-white">{formatDateTime(invoice.paid_at)}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("invoices.updatedAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatDateTime(invoice.updated_at)}</p>
              </div>
            </div>
          </Card>

          {/* Order Information */}
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("invoices.orderInformation")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.orderNumber")}</label>
                <p className="font-medium text-dark dark:text-white">
                  <Link href={`/orders/show/${order.id}`} className="text-primary hover:underline font-mono">
                    {order.order_number}
                  </Link>
                </p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.status")}</label>
                <p className="font-medium text-dark dark:text-white">{order.status}</p>
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
                <label className="text-sm text-ld dark:text-white/70">{t("orders.totalAmount")}</label>
                <p className="font-medium text-dark dark:text-white">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.createdAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
          </Card>

          {/* Customer/Charity Information */}
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">
              {order.customer ? t("orders.customer") : t("orders.charity")}
            </h2>
            {order.customer ? (
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
              </div>
            ) : order.charity ? (
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
                        <td className="px-4 py-3 text-dark dark:text-white">{item.name}</td>
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
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryStatus")}</label>
                  <p className="font-medium text-dark dark:text-white">{order.delivery.delivery_status}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.paymentMethod")}</label>
                  <p className="font-medium text-dark dark:text-white">{getPaymentMethodLabel(order.delivery.payment_method)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Invoice Summary */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("invoices.invoiceSummary")}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-ld">
                <span className="text-sm text-ld dark:text-white/70">{t("invoices.totalBeforeDiscounts")}</span>
                <span className="font-medium text-dark dark:text-white">{formatCurrency(invoice.total_before_discounts)}</span>
              </div>
              
              {invoice.offer_discount > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-ld">
                  <span className="text-sm text-ld dark:text-white/70">{t("invoices.offerDiscount")}</span>
                  <span className="font-medium text-dark dark:text-white text-error">-{formatCurrency(invoice.offer_discount)}</span>
                </div>
              )}
              
              {invoice.used_points > 0 && (
                <>
                  <div className="flex justify-between items-center pb-3 border-b border-ld">
                    <span className="text-sm text-ld dark:text-white/70">{t("invoices.usedPoints")}</span>
                    <span className="font-medium text-dark dark:text-white">{invoice.used_points}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-ld">
                    <span className="text-sm text-ld dark:text-white/70">{t("invoices.pointsDiscount")}</span>
                    <span className="font-medium text-dark dark:text-white text-error">-{formatCurrency(invoice.points_discount)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center pb-3 border-b border-ld">
                <span className="text-sm text-ld dark:text-white/70">{t("invoices.totalDiscount")}</span>
                <span className="font-medium text-dark dark:text-white text-error">-{formatCurrency(invoice.total_discount)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-ld">
                <span className="text-sm text-ld dark:text-white/70">{t("invoices.taxAmount")}</span>
                <span className="font-medium text-dark dark:text-white">{formatCurrency(invoice.tax_amount)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-dark dark:text-white">{t("invoices.amountDue")}</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(invoice.amount_due)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceShow;

