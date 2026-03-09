"use client";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

const BoxedAuthLogin = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // RTK Query mutation hook
  const [loginMutation, { isLoading, error: apiError }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await loginMutation({ login, password }).unwrap();
      
      if (result.success) {
        // Dispatch action to store credentials in Redux and localStorage
        dispatch(setCredentials({
          token: result.data.token,
          tokenType: result.data.token_type,
          admin: result.data.admin,
          rolePermissions: result.data.role_permissions || {},
        }));
        
        // Redirect to dashboard
        router.push("/");
      } else {
        setErrorMessage(result.message || t("auth.login.failed"));
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || t("auth.login.serverError"));
      console.error("Login error:", err);
    }
  };

  return (
    <>
      <form className="mt-6" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="login">{t("auth.login.emailOrPhone")}</Label>
          </div>
          <TextInput
            id="login"
            type="text"
            sizing="md"
            className="form-control"
            placeholder={t("auth.login.emailOrPhonePlaceholder")}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password">{t("auth.login.password")}</Label>
            {/* <Link className="text-xs text-primary" href={'/auth/auth2/forgot-password'}>هل نسيت كلمة المرور؟</Link> */}
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder={t("auth.login.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="accept" 
              className="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <Label
              htmlFor="accept"  
              className="font-medium cursor-pointer"
            >
              {t("auth.login.rememberMe")}
            </Label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="rounded-md w-full bg-sky dark:bg-sky hover:bg-dark dark:hover:bg-dark"
          disabled={isLoading}
        >
          {isLoading ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>
    </>
  );
};

export default BoxedAuthLogin;
