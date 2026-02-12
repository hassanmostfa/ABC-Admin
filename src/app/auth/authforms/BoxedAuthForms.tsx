"use client";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

const BoxedAuthLogin = () => {
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
        setErrorMessage(result.message || "فشل تسجيل الدخول. يرجى التحقق من البيانات المدخلة.");
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || 
        "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."
      );
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
            <Label htmlFor="login">البريد الإلكتروني أو رقم الهاتف</Label>
          </div>
          <TextInput
            id="login"
            type="text"
            sizing="md"
            className="form-control"
            placeholder="أدخل بريدك الإلكتروني أو رقم الهاتف"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password">كلمة المرور</Label>
            {/* <Link className="text-xs text-primary" href={'/auth/auth2/forgot-password'}>هل نسيت كلمة المرور؟</Link> */}
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            className="form-control"
            placeholder="أدخل كلمة المرور"
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
              ابقني مسجلاً للدخول
            </Label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="rounded-md w-full bg-sky dark:bg-sky hover:bg-dark dark:hover:bg-dark"
          disabled={isLoading}
        >
          {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </>
  );
};

export default BoxedAuthLogin;
