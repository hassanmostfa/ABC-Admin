"use client";

import React, { useState } from "react";
import {
  Card,
  Badge,
  Spinner,
  Label,
  Select,
  Pagination,
  Tooltip,
  Button,
} from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetActivityLogsQuery } from "@/store/api/activityLogsApi";
import { useTranslation } from "react-i18next";
import type { ActivityLog } from "@/store/api/activityLogsApi";

const ActivityLogsPage = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [adminFilter, setAdminFilter] = useState<string>("");
  const [modelFilter, setModelFilter] = useState<string>("");

  const { data, isLoading, error } = useGetActivityLogsQuery({
    page: currentPage,
    per_page: 15,
  });

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action: string) => {
    const config: Record<
      string,
      { color: "success" | "failure" | "warning" | "info"; labelKey: string }
    > = {
      created: { color: "success", labelKey: "activityLogs.action.created" },
      updated: { color: "info", labelKey: "activityLogs.action.updated" },
      deleted: { color: "failure", labelKey: "activityLogs.action.deleted" },
    };
    const c = config[action] || {
      color: "info" as const,
      labelKey: "",
    };
    const label = c.labelKey ? t(c.labelKey) : (action.charAt(0).toUpperCase() + action.slice(1));
    return (
      <Badge color={c.color} className="w-fit">
        {label}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, "success" | "failure" | "warning" | "info"> = {
      GET: "info",
      POST: "success",
      PUT: "warning",
      PATCH: "warning",
      DELETE: "failure",
    };
    return (
      <Badge color={colors[method] || "info"} className="w-fit font-mono text-xs">
        {method}
      </Badge>
    );
  };

  const truncateUserAgent = (ua: string, max = 50) => {
    if (!ua) return "—";
    return ua.length > max ? ua.slice(0, max) + "…" : ua;
  };

  // Client-side filter if API doesn't support it
  const filteredData = React.useMemo(() => {
    let list = data?.data ?? [];
    if (adminFilter) {
      list = list.filter((log) => String(log.admin_id) === adminFilter);
    }
    if (modelFilter) {
      list = list.filter((log) => log.model === modelFilter);
    }
    return list;
  }, [data?.data, adminFilter, modelFilter]);

  const uniqueModels = React.useMemo(() => {
    const set = new Set<string>();
    data?.data?.forEach((log) => set.add(log.model));
    return Array.from(set).sort();
  }, [data?.data]);

  const uniqueAdmins = React.useMemo(() => {
    const map = new Map<number, { id: number; name: string; email: string }>();
    data?.data?.forEach((log) => {
      if (!map.has(log.admin_id)) {
        map.set(log.admin_id, {
          id: log.admin_id,
          name: log.admin_name,
          email: log.admin_email,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.data]);

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
              <Icon
                icon="solar:danger-circle-bold"
                height={24}
                className="text-error"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">
              {t("activityLogs.error")}
            </h3>
            <p className="text-sm text-dark dark:text-white">
              {t("activityLogs.loadError")}
            </p>
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
            {t("activityLogs.title")}
          </h1>
          <p className="text-sm text-ld mt-2">{t("activityLogs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-ld dark:text-white/70">
          <Icon icon="solar:history-bold-duotone" height={28} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="adminFilter" className="mb-2 block">
              {t("activityLogs.admin")}
            </Label>
            <Select
              id="adminFilter"
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("activityLogs.allAdmins")}</option>
              {uniqueAdmins.map((admin) => (
                <option key={admin.id} value={String(admin.id)}>
                  {admin.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="modelFilter" className="mb-2 block">
              {t("activityLogs.model")}
            </Label>
            <Select
              id="modelFilter"
              value={modelFilter}
              onChange={(e) => {
                setModelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="activity-logs-select"
            >
              <option value="">{t("activityLogs.allModels")}</option>
              {uniqueModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={() => {
                setAdminFilter("");
                setModelFilter("");
                setCurrentPage(1);
              }}
              className="bg-primary hover:bg-primary/90 rounded-lg" >
              {t("activityLogs.reset")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs uppercase bg-lightgray dark:bg-darkgray">
              <tr>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  #
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.timestamp")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.admin")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.action")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.model")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.method")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.ipAddress")}
                </th>
                <th className="px-4 py-3 font-semibold text-dark dark:text-white">
                  {t("activityLogs.userAgent")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((log: ActivityLog, index: number) => (
                <tr
                  key={`${log.timestamp}-${log.model}-${log.model_id}-${index}`}
                  className="border-b border-ld hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-dark dark:text-white">
                    {data?.pagination
                      ? data.pagination.from + index
                      : index + 1}
                  </td>
                  <td className="px-4 py-3 text-ld dark:text-white/70 whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-dark dark:text-white">
                        {log.admin_name}
                      </div>
                      <div className="text-xs text-ld dark:text-white/70">
                        {log.admin_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                  <td className="px-4 py-3">
                    <span className="text-dark dark:text-white font-medium">
                      {log.model}
                    </span>
                    <span className="text-ld dark:text-white/70 text-xs ms-1">
                      #{log.model_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getMethodBadge(log.method)}
                  </td>
                  <td className="px-4 py-3 text-ld dark:text-white/70 font-mono text-xs">
                    {log.ip_address}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <Tooltip content={log.user_agent} placement="left">
                      <span className="text-ld dark:text-white/70 text-xs truncate block cursor-help">
                        {truncateUserAgent(log.user_agent)}
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!filteredData || filteredData.length === 0) && (
            <div className="text-center py-12">
              <Icon
                icon="solar:history-bold-duotone"
                height={64}
                className="text-ld mx-auto mb-4"
              />
              <p className="text-ld dark:text-white/70">
                {t("activityLogs.noLogs")}
              </p>
            </div>
          )}
        </div>

        {/* Pagination - only when no client filter applied */}
        {!adminFilter && !modelFilter && data?.pagination && data.pagination.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-ld">
            <div className="text-sm text-ld dark:text-white/70">
              {t("activityLogs.showing", {
                from: data.pagination.from,
                to: data.pagination.to,
                total: data.pagination.total,
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={data.pagination.last_page}
              onPageChange={setCurrentPage}
              showIcons
              previousLabel={t("activityLogs.previous")}
              nextLabel={t("activityLogs.next")}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogsPage;
