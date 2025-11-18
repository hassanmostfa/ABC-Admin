"use client";
import React, { useState, useEffect } from "react";
import { Card, Label, TextInput, Checkbox, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useGetPermissionsQuery } from "@/store/api/permissionsApi";
import { useGetRoleByIdQuery, useUpdateRoleMutation } from "@/store/api/rolesApi";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/app/context/NotificationContext";
import { useTranslation } from "react-i18next";

type Action = 'view' | 'add' | 'edit' | 'delete';

interface PermissionState {
  [permissionId: number]: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const EditRole = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const roleId = Number(params.id);
  const { showNotification } = useNotification();
  
  const { data: permissionsData, isLoading: loadingPermissions } = useGetPermissionsQuery();
  const { data: roleData, isLoading: loadingRole } = useGetRoleByIdQuery(roleId);
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation();

  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize form with fetched role data
  useEffect(() => {
    if (roleData?.data && permissionsData?.data && !initialized) {
      setRoleName(roleData.data.role_name);

      // Convert slug-based permissions to ID-based state
      const permissionState: PermissionState = {};
      
      permissionsData.data.forEach((category) => {
        category.permission_items.forEach((permission) => {
          const rolePermission = roleData.data.permissions[permission.slug];
          if (rolePermission) {
            permissionState[permission.id] = {
              view: rolePermission.view === 1,
              add: rolePermission.add === 1,
              edit: rolePermission.edit === 1,
              delete: rolePermission.delete === 1,
            };
          } else {
            permissionState[permission.id] = {
              view: false,
              add: false,
              edit: false,
              delete: false,
            };
          }
        });
      });

      setPermissions(permissionState);
      setInitialized(true);
    }
  }, [roleData, permissionsData, initialized]);

  const handleToggleAction = (permissionId: number, action: Action) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [action]: !prev[permissionId]?.[action],
      },
    }));
  };

  const handleToggleCategoryAction = (category: any, action: Action) => {
    const allChecked = category.permission_items.every(
      (item: any) => permissions[item.id]?.[action]
    );

    const updates: PermissionState = {};
    category.permission_items.forEach((item: any) => {
      updates[item.id] = {
        ...permissions[item.id],
        [action]: !allChecked,
      };
    });

    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  const isCategoryActionChecked = (category: any, action: Action) => {
    return category.permission_items.every(
      (item: any) => permissions[item.id]?.[action]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName.trim()) {
      showNotification("error", t("roles.error"), t("roles.enterRoleName"));
      return;
    }

    // Convert permissions state to API format
    const permissionsPayload: {
      [slug: string]: {
        view: number;
        add: number;
        edit: number;
        delete: number;
      };
    } = {};

    let hasPermissions = false;

    // Build permissions object using slugs from the API data
    permissionsData?.data?.forEach((category) => {
      category.permission_items.forEach((permission) => {
        const permActions = permissions[permission.id];
        if (permActions) {
          permissionsPayload[permission.slug] = {
            view: permActions.view ? 1 : 0,
            add: permActions.add ? 1 : 0,
            edit: permActions.edit ? 1 : 0,
            delete: permActions.delete ? 1 : 0,
          };
          if (permActions.view || permActions.add || permActions.edit || permActions.delete) {
            hasPermissions = true;
          }
        } else {
          // Default all to 0 if not set
          permissionsPayload[permission.slug] = {
            view: 0,
            add: 0,
            edit: 0,
            delete: 0,
          };
        }
      });
    });

    if (!hasPermissions) {
      showNotification("error", t("roles.error"), t("roles.selectAtLeastOne"));
      return;
    }

    try {
      const result = await updateRole({
        roleId,
        data: {
          name: roleName,
          permissions: permissionsPayload,
        },
      }).unwrap();

      if (result.success) {
        showNotification("success", t("roles.success"), t("roles.updateSuccess"));
        setTimeout(() => {
          router.push("/roles-and-permissions");
        }, 1500);
      }
    } catch (err: any) {
      showNotification(
        "error",
        t("roles.error"),
        err?.data?.message || t("roles.updateError")
      );
    }
  };

  if (loadingPermissions || loadingRole) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/roles-and-permissions">
              <button className="h-10 w-10 rounded-full hover:bg-lightprimary dark:hover:bg-darkprimary flex items-center justify-center transition-colors">
                <Icon icon="solar:arrow-right-bold" height={20} className="text-dark dark:text-white" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-dark dark:text-white">
              {t("roles.editRole")}
            </h1>
          </div>
          <p className="text-sm text-ld mr-12">
            {t("roles.editDescription")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          {/* Role Name Input */}
          <div className="mb-6">
            <Label htmlFor="roleName" className="mb-2 block font-semibold text-dark dark:text-white">
              {t("roles.roleName")}
            </Label>
            <TextInput
              id="roleName"
              placeholder={t("roles.enterRoleName")}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              className="max-w-md"
            />
          </div>

          {/* Permissions Grid */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {permissionsData?.data?.map((category) => (
                <div key={category.id} className="space-y-3">
                  {/* Category Header */}
                  <div className="bg-lightgray dark:bg-darkgray rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-dark dark:text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isCategoryActionChecked(category, 'view')}
                            onChange={() => handleToggleCategoryAction(category, 'view')}
                          />
                          <span className="text-sm text-dark dark:text-white">{t("roles.view")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isCategoryActionChecked(category, 'add')}
                            onChange={() => handleToggleCategoryAction(category, 'add')}
                          />
                          <span className="text-sm text-dark dark:text-white">{t("roles.add")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isCategoryActionChecked(category, 'edit')}
                            onChange={() => handleToggleCategoryAction(category, 'edit')}
                          />
                          <span className="text-sm text-dark dark:text-white">{t("roles.edit")}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isCategoryActionChecked(category, 'delete')}
                            onChange={() => handleToggleCategoryAction(category, 'delete')}
                          />
                          <span className="text-sm text-dark dark:text-white">{t("roles.delete")}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Permission Items */}
                  <div className="space-y-2">
                    {category.permission_items.map((permission) => (
                      <div
                        key={permission.id}
                        className="border border-ld rounded-lg p-3 hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-dark dark:text-white">
                            {permission.name}
                          </span>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={permissions[permission.id]?.view || false}
                                onChange={() => handleToggleAction(permission.id, 'view')}
                              />
                              <span className="text-sm text-ld dark:text-white/70">{t("roles.view")}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={permissions[permission.id]?.add || false}
                                onChange={() => handleToggleAction(permission.id, 'add')}
                              />
                              <span className="text-sm text-ld dark:text-white/70">{t("roles.add")}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={permissions[permission.id]?.edit || false}
                                onChange={() => handleToggleAction(permission.id, 'edit')}
                              />
                              <span className="text-sm text-ld dark:text-white/70">{t("roles.edit")}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={permissions[permission.id]?.delete || false}
                                onChange={() => handleToggleAction(permission.id, 'delete')}
                              />
                              <span className="text-sm text-ld dark:text-white/70">{t("roles.delete")}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-ld">
            <Link href="/roles-and-permissions">
              <button
                type="button"
                className="px-6 py-2.5 border border-ld rounded-lg text-dark dark:text-white hover:bg-lightgray dark:hover:bg-darkgray transition-colors"
              >
                {t("roles.cancel")}
              </button>
            </Link>
            <button
              type="submit"
              disabled={updatingRole}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updatingRole ? (
                <>
                  <Spinner size="sm" />
                  {t("roles.updating")}
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" height={20} />
                  {t("roles.saveChanges")}
                </>
              )}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditRole;

