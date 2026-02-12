"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentAdmin } from "@/store/selectors/authSelectors";
import { setRolePermissions, updateAdminRole } from "@/store/slices/authSlice";
import { useGetRoleByIdQuery } from "@/store/api/rolesApi";
import type { RolePermissions } from "@/store/api/authApi";

/**
 * Fetches fresh role data from /admin/roles/{role_id} on every mount/refresh.
 * Updates role permissions and role info in Redux + localStorage.
 */
const RolePermissionsRefresher = () => {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectCurrentAdmin);
  const roleId = admin?.role_id;

  const { data } = useGetRoleByIdQuery(roleId!, {
    skip: !roleId,
    refetchOnMountOrArgChange: true, // Fetch on every mount (page refresh) and when roleId changes
  });

  useEffect(() => {
    if (data?.success && data?.data) {
      const { permissions, role_id, role_name, role_description, is_active } = data.data;

      if (permissions) {
        dispatch(setRolePermissions(permissions as RolePermissions));
      }

      dispatch(
        updateAdminRole({
          id: role_id,
          name: role_name,
          description: role_description,
          is_active,
        })
      );
    }
  }, [data, dispatch]);

  return null;
};

export default RolePermissionsRefresher;
