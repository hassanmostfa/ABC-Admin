"use client";
import React, { use, useState } from "react";
import { Card, Badge, Spinner, Button, Select, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useRegenerateOrderPaymentLinkMutation,
  useSwitchOrderToPaymentLinkMutation,
} from "@/store/api/ordersApi";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useNotification } from "@/app/context/NotificationContext";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { formatKuwaitDate, formatKuwaitDateTime } from "@/utils/formatKuwaitDateTime";

interface OrderShowProps {
  params: Promise<{ id: string }>;
}

const OrderShow = ({ params }: OrderShowProps) => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);
  const { data: orderData, isLoading, error } = useGetOrderByIdQuery(orderId);
  const [updateOrderStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [regeneratePaymentLink, { isLoading: regeneratingLink }] = useRegenerateOrderPaymentLinkMutation();
  const [switchToPaymentLink] = useSwitchOrderToPaymentLinkMutation();
  const [paymentLinkCopied, setPaymentLinkCopied] = useState(false);
  const [switchingPaymentSrc, setSwitchingPaymentSrc] = useState<"knet" | "cc" | null>(null);

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

  const formatCurrency = (amount: number) => {
    const locale = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: t("orders.paymentMethod.cashOnDelivery"),
      wallet: t("orders.paymentMethod.wallet"),
      card: t("orders.paymentMethod.card"),
      online_link: t("orders.paymentMethod.onlineLink"),
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

  const handleSwitchToPaymentLink = async (src: "knet" | "cc") => {
    setSwitchingPaymentSrc(src);
    try {
      const res = await switchToPaymentLink({ orderId, src }).unwrap();
      showNotification(
        "success",
        t("orders.success"),
        (typeof res.message === "string" && res.message.trim()) ? res.message : t("orders.switchToPaymentLinkSuccess")
      );
    } catch (err: unknown) {
      showNotification("error", t("orders.error"), getApiErrorMessage(err, t("orders.switchToPaymentLinkError")));
    } finally {
      setSwitchingPaymentSrc(null);
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
  const orderSrc = order.src;
  const latestPayment = (order as any).payments?.[0];
  const invoicePending = order.invoice?.status?.toLowerCase() === "pending";
  const showRegeneratePaymentLink =
    order.payment_method === "online_link" && order.invoice && invoicePending;
  const currentPaymentLink = order.invoice?.payment_link || order.payment_link || "";

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
            value={order.status ?? ''}
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
                <div className="mt-1">{getStatusBadge(order.status ?? '')}</div>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.paymentMethod")}</label>
                <p className="font-medium text-dark dark:text-white">
                  {getPaymentMethodLabel(order.payment_method ?? "")}
                  {order.payment_method === "online_link" && orderSrc === "knet" && (
                    <span className="text-sm font-normal text-ld dark:text-white/70 ms-1">
                      ({t("enterSaleOrder.paymentKnet")})
                    </span>
                  )}
                  {order.payment_method === "online_link" && orderSrc === "cc" && (
                    <span className="text-sm font-normal text-ld dark:text-white/70 ms-1">
                      ({t("enterSaleOrder.paymentCreditCard")})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.deliveryType")}</label>
                <p className="font-medium text-dark dark:text-white">{getDeliveryTypeLabel(order.delivery_type ?? '')}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.createdAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatKuwaitDateTime(order.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-ld dark:text-white/70">{t("orders.updatedAt")}</label>
                <p className="font-medium text-dark dark:text-white">{formatKuwaitDateTime(order.updated_at)}</p>
              </div>
            </div>
            {order.payment_method === "cash" && (
              <div className="mt-6 pt-6 border-t border-ld">
                <p className="text-sm font-semibold text-dark dark:text-white mb-1">{t("orders.switchToOnlinePayment")}</p>
                <p className="text-xs text-ld dark:text-white/70 mb-4">{t("orders.switchToOnlinePaymentHint")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    color="primary"
                    disabled={switchingPaymentSrc !== null}
                    onClick={() => handleSwitchToPaymentLink("knet")}
                  >
                    {switchingPaymentSrc === "knet" ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <Icon icon="solar:card-bold" height={18} className="me-2" />
                    )}
                    {t("enterSaleOrder.paymentKnet")}
                  </Button>
                  <Button
                    type="button"
                    color="gray"
                    disabled={switchingPaymentSrc !== null}
                    onClick={() => handleSwitchToPaymentLink("cc")}
                  >
                    {switchingPaymentSrc === "cc" ? (
                      <Spinner size="sm" className="me-2" />
                    ) : (
                      <Icon icon="solar:card-2-bold" height={18} className="me-2" />
                    )}
                    {t("enterSaleOrder.paymentCreditCard")}
                  </Button>
                </div>
              </div>
            )}
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
                <table className="w-full text-sm text-center">
                  <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.product")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.sku")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("products.size")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.quantity")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.unitPrice")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.totalPrice")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.taxAmount")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.offerDiscount")}</th>
                      <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("orders.isOffer")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-ld">
                        <td className="px-4 py-3 text-center">
                          <div>
                            <p className="font-medium text-dark dark:text-white">{item.name}</p>
                            <p className="text-xs text-ld dark:text-white/70">{item.product_variant.product_name_ar}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white font-mono text-xs">{item.sku}</td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white">{item.product_variant.variant_size || "-"}</td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white font-semibold">{formatCurrency(item.total_price)}</td>
                        <td className="px-4 py-3 text-center text-dark dark:text-white">
                          {Number((item as any).tax ?? 0) > 0
                            ? formatCurrency(Number((item as any).tax))
                            : <span className="text-ld">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {Number((item as any).discount ?? 0) > 0 ? (
                            <span className="text-success font-semibold">-{formatCurrency(Number((item as any).discount))}</span>
                          ) : (
                            <span className="text-ld">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.is_offer ? (
                            <Badge color="success" className="w-fit mx-auto">{t("orders.yes")}</Badge>
                          ) : (
                            <Badge color="gray" className="w-fit mx-auto">{t("orders.no")}</Badge>
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
                  <p className="font-medium text-dark dark:text-white">{formatKuwaitDateTime(order.delivery.delivery_datetime)}</p>
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
                {Number(order.invoice.tax_amount ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.taxAmount")}</span>
                    <span className="font-medium text-dark dark:text-white">{formatCurrency(order.invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.deliveryFees")}</span>
                  <span className="font-medium text-dark dark:text-white">{formatCurrency(order.invoice.delivery_fee ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.offerDiscount")}</span>
                  <span className="font-medium text-dark dark:text-white text-success">-{formatCurrency(order.invoice.offer_discount)}</span>
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
                {showRegeneratePaymentLink && (
                  <div className="pt-2 space-y-3 border-t border-ld mt-3">
                    <Button
                      color="primary"
                      className="w-full"
                      disabled={regeneratingLink}
                      onClick={async () => {
                        try {
                          await regeneratePaymentLink(orderId).unwrap();
                          showNotification("success", t("orders.success"), t("orders.paymentLinkRegenerated"));
                        } catch (err: unknown) {
                          showNotification(
                            "error",
                            t("orders.error"),
                            getApiErrorMessage(err, t("orders.regeneratePaymentLinkError"))
                          );
                        }
                      }}
                    >
                      {regeneratingLink ? (
                        <Spinner size="sm" className="me-2" />
                      ) : (
                        <Icon icon="solar:refresh-bold" height={18} className="me-2" />
                      )}
                      {t("orders.regeneratePaymentLink")}
                    </Button>
                    {currentPaymentLink ? (
                      <div className="flex gap-2">
                        <TextInput
                          readOnly
                          value={currentPaymentLink}
                          className="flex-1 font-mono text-xs bg-lightgray dark:bg-darkgray border-ld"
                        />
                        <Button
                          color="gray"
                          className="shrink-0"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(currentPaymentLink);
                              setPaymentLinkCopied(true);
                              showNotification("success", t("enterSaleOrder.copied"), t("enterSaleOrder.linkCopied"));
                              setTimeout(() => setPaymentLinkCopied(false), 2000);
                            } catch {
                              showNotification("error", t("orders.error"), t("enterSaleOrder.copyFailed"));
                            }
                          }}
                        >
                          <Icon
                            icon={paymentLinkCopied ? "solar:check-circle-bold" : "solar:copy-bold"}
                            height={18}
                            className="me-1"
                          />
                          {paymentLinkCopied ? t("enterSaleOrder.copied") : t("enterSaleOrder.copyLink")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )}
                {order.invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.paidAt")}</span>
                    <span className="font-medium text-dark dark:text-white">{formatKuwaitDateTime(order.invoice.paid_at)}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Payment Data */}
          {latestPayment && (
            <Card>
              <h2 className="text-xl font-bold text-dark dark:text-white mb-4">{t("orders.paymentData")}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.paymentNumber")}</span>
                  <span className="font-medium text-dark dark:text-white">{latestPayment.payment_number || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.gateway")}</span>
                  <span className="font-medium text-dark dark:text-white">{latestPayment.gateway || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.method")}</span>
                  <span className="font-medium text-dark dark:text-white">{latestPayment.method || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.paidAmount")}</span>
                  <span className="font-medium text-dark dark:text-white">{formatCurrency(Number(latestPayment.amount || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-ld dark:text-white/70">{t("orders.paymentStatus")}</span>
                  <span className="font-medium text-dark dark:text-white">{latestPayment.status || "-"}</span>
                </div>
                {latestPayment.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.paymentDate")}</span>
                    <span className="font-medium text-dark dark:text-white">{formatKuwaitDateTime(latestPayment.paid_at)}</span>
                  </div>
                )}
                {latestPayment.track_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.trackId")}</span>
                    <span className="font-medium text-dark dark:text-white break-all text-right">{latestPayment.track_id}</span>
                  </div>
                )}
                {latestPayment.tran_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.transactionId")}</span>
                    <span className="font-medium text-dark dark:text-white break-all text-right">{latestPayment.tran_id}</span>
                  </div>
                )}
                {latestPayment.receipt_id && (
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-ld dark:text-white/70">{t("orders.receiptId")}</span>
                    <span className="font-medium text-dark dark:text-white break-all text-right">{latestPayment.receipt_id}</span>
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
                  <p className="font-medium text-dark dark:text-white">{formatKuwaitDate(order.offer.offer_start_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-ld dark:text-white/70">{t("orders.offerEndDate")}</label>
                  <p className="font-medium text-dark dark:text-white">{formatKuwaitDate(order.offer.offer_end_date)}</p>
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

