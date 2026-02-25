"use client";

import React, { useState } from "react";
import { Card, Badge, Spinner, Label, Select, Button, TextInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetPointsTransactionsQuery } from "@/store/api/pointsTransactionsApi";
import { useTranslation } from "react-i18next";

const PointsTransactionsPage = () => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useGetPointsTransactionsQuery({
    page: currentPage,
    per_page: 15,
    ...(typeFilter && { type: typeFilter }),
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount == null) return "—";
    const locale = i18n.language?.startsWith("ar") ? "ar-SA" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "KWD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    const config: Record<
      string,
      { color: "success" | "info" | "warning"; labelKey: string }
    > = {
      points_earned: { color: "success", labelKey: "pointsTransactions.type.earned" },
      points_to_wallet: { color: "info", labelKey: "pointsTransactions.type.toWallet" },
    };
    const c = config[type] || { color: "info" as const, labelKey: "" };
    const label = c.labelKey ? t(c.labelKey) : type;
    return (
      <Badge color={c.color} className="w-fit">
        {label}
      </Badge>
    );
  };

  // Client-side search by customer name, phone, description
  const filteredData = React.useMemo(() => {
    let list = data?.data ?? [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (tx) =>
          tx.customer?.name?.toLowerCase().includes(q) ||
          tx.customer?.phone?.toLowerCase().includes(q) ||
          tx.customer?.email?.toLowerCase().includes(q) ||
          (tx.description && tx.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.data, searchQuery]);

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
            <h3 className="text-lg font-semibold text-error mb-1">{t("pointsTransactions.error")}</h3>
            <p className="text-sm text-dark dark:text-white">{t("pointsTransactions.loadError")}</p>
          </div>
        </div>
      </div>
    );
  }

  const pagination = data?.pagination;
  const showPagination = pagination && pagination.last_page > 1 && !searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">{t("pointsTransactions.title")}</h1>
          <p className="text-sm text-ld mt-2">{t("pointsTransactions.subtitle")}</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-4 mb-6">
          {/* <div className="min-w-[200px]">
            <Label className="mb-2 block">{t("pointsTransactions.search")}</Label>
            <TextInput
              placeholder={t("pointsTransactions.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={() => <Icon icon="solar:magnifer-bold" height={18} />}
            />
          </div> */}
          <div className="min-w-[250px]">
            <Label className="mb-2 block">{t("pointsTransactions.type")}</Label>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("pointsTransactions.allTypes")}</option>
              <option value="points_earned">{t("pointsTransactions.type.earned")}</option>
              <option value="points_to_wallet">{t("pointsTransactions.type.toWallet")}</option>
            </Select>
          </div>
          <Button
            color="gray"
            onClick={() => {
              setTypeFilter("");
              setSearchQuery("");
              setCurrentPage(1);
            }}
          >
            {t("pointsTransactions.reset")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">#</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.type")}</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.customer")}</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.points")}</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.amount")}</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.description")}</th>
                <th className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{t("pointsTransactions.createdAt")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((tx, index) => (
                <tr
                  key={tx.id}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-4 py-3 text-center font-medium text-dark dark:text-white">
                    {pagination && !searchQuery.trim() ? pagination.from + index : index + 1}
                  </td>
                  <td className="px-4 py-3 text-center">{getTypeBadge(tx.type)}</td>
                  <td className="px-4 py-3 text-center">
                    {tx.customer ? (
                      <div>
                        <div className="font-medium text-dark dark:text-white">{tx.customer.name}</div>
                        <div className="text-xs text-ld dark:text-white/70">{tx.customer.phone}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-dark dark:text-white">{tx.points}</td>
                  <td className="px-4 py-3 text-center text-dark dark:text-white">{formatCurrency(tx.amount)}</td>
                  <td className="px-4 py-3 text-center text-ld dark:text-white/70 max-w-xs truncate" title={tx.description || ""}>
                    {tx.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-ld dark:text-white/70 whitespace-nowrap">
                    {formatDate(tx.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:star-bold-duotone" height={64} className="text-ld mx-auto mb-4" />
              <p className="text-ld dark:text-white/70">{t("pointsTransactions.noTransactions")}</p>
            </div>
          )}
        </div>

        {showPagination && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("pointsTransactions.showing", {
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
                {t("pointsTransactions.previous")}
              </Button>
              <span className="px-3 py-2 text-sm text-ld dark:text-white/70">
                {t("pointsTransactions.page")} {currentPage} {t("pointsTransactions.of")} {pagination.last_page}
              </span>
              <Button
                size="sm"
                color="gray"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.last_page}
              >
                {t("pointsTransactions.next")}
                <Icon icon="solar:alt-arrow-left-bold" height={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PointsTransactionsPage;
