"use client";

import logoInstagram from "@/app/assets/images/text-logo.png";
import Image from "next/image";
import styles from "./forgot.module.scss";
import Link from "next/link";
import { showToast } from "@/app/helpers/Toastify";
import { ToastContainer } from "react-toastify";
import { client } from "@/app/helpers/fetch_api/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/app/components/Loading/Loading";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const form = new FormData(e.target);
      const email = Cookies.get("email_forgot");
      const passwordData = {
        password: form.get("password"),
        repassword: form.get("repassword"),
        email: email,
      };
      const response = await client.post("/auth/forgot-password", passwordData);
      if (response.data.status === 400 || response.data.status === 500) {
        showToast("error", response.data.message);
        return;
      }
      setIsLoading(false);
      showToast("success", response.data.message);
      showToast("info", "Đang tới trang đăng nhập", () => {
        setIsLoading(true);
        router.push("/login");
      });
    } catch (e) {
      console.log(e);
      showToast("error", "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      {isLoading && <Loading />}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.box}>
            <Link href="/login">
              <Image
                src={logoInstagram}
                alt="logo-instagram"
                width={175}
                height={50}
                className="mt-10"
              />
            </Link>
            <h1 className="text-gray-700 mt-3 mb-3">
              Kiểm tra email của bạn để lấy mật khẩu nhé
            </h1>
            <form
              action=""
              className={styles.form}
              onSubmit={handleForgotPassword}
            >
              <div className="relative w-full min-w-[200px] h-10">
                <input
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-indigo-500"
                  placeholder=" "
                  required
                  name="password"
                  type="password"
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400 peer-focus:text-indigo-500 before:border-blue-gray-200 peer-focus:before:!border-indigo-500 after:border-blue-gray-200 peer-focus:after:!border-indigo-500">
                  Mật khẩu
                </label>
              </div>
              <div className="relative w-full min-w-[200px] h-10">
                <input
                  className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-teal-500"
                  placeholder=" "
                  required
                  type="password"
                  name="repassword"
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400 peer-focus:text-teal-500 before:border-blue-gray-200 peer-focus:before:!border-teal-500 after:border-blue-gray-200 peer-focus:after:!border-teal-500">
                  Đặt lại mật khẩu
                </label>
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-400 text-white p-2 text-xl"
              >
                Xác nhận
              </button>
            </form>
          </div>
          <div className={styles.box_login}>
            <h2>Bạn đã có tài khoản?</h2>
            <Link href="/login" className="text-xl text-blue-400">
              Đăng nhập
            </Link>
          </div>
          <p className="text-center text-gray-500 text-sm mt-10">
            © 2025 InstaReflection from Quoc Anh
          </p>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
