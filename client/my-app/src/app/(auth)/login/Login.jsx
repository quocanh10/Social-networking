"use client";

import Image from "next/image";
import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import homePhone from "@/app/assets/images/home-phones.png";
import textLogo from "@/app/assets/images/text-logo.png";
import screenShot1 from "@/app/assets/images/screenshot1.png";
import screenShot2 from "@/app/assets/images/screenshot2.png";
import screenShot3 from "@/app/assets/images/screenshot3.png";
import screenShot4 from "@/app/assets/images/screenshot4.png";
import styles from "./login.module.scss";
import clsx from "clsx";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { showToast } from "@/app/helpers/Toastify";
import { client } from "@/app/helpers/fetch_api/client";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { hideEmail } from "@/app/helpers/hidden_email";
import Cookies from "js-cookie";
import { setToken } from "@/app/actions/settoken.action";
import Loading from "@/app/components/Loading/Loading";

const screenShots = [screenShot1, screenShot2, screenShot3, screenShot4];

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const [currentScreenShot, setCurrentScreenShot] = useState(0);
  const [emailInput, setEmail] = useState("");
  const [toggle, setToggle] = useState(false); // nhấn ra ngoài để tắt form OTP

  const [toggleForgot, setToggleForgot] = useState(false); // nhấn vào quên mật khẩu để mở form quên mật khẩu

  // Tạo một mảng refs để tham chiếu đến các input
  const inputRefs = useRef([]);

  const router = useRouter();

  // Hàm xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    setEmail(form.get("email"));

    const userData = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      // setIsLoading(true);
      console.log("chuẩn bị gửi req");
      console.log("userData", userData);
      const response = await client.post("/auth/login", userData);
      console.log("54", response);
      if (response.data.status !== 200 && response.data.status !== 202) {
        console.log("đã nhảy vào đây", response.data);
        showToast("error", response.data.message);
        return;
      } else if (response.data.status === 202) {
        setToggle(true);
        showToast("info", response.data.message);
        return;
      }
      console.log("đã đến được 64"); // ✅ Bây giờ sẽ chạy
      await setToken(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );

      router.push("/");
    } catch (e) {
      console.log(e);
      showToast("error", "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm ẩn hiện form OTP
  const handleToggle = () => {
    setToggle(!toggle);
  };

  // Hàm ẩn hiện form forgot password
  const handleToggleForgot = () => {
    setToggleForgot(!toggleForgot);
  };

  // Hàm verify OTP
  const handleConfirmOTP = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const data = {
      box_1: form.get("box_1"),
      box_2: form.get("box_2"),
      box_3: form.get("box_3"),
      box_4: form.get("box_4"),
      email: emailInput,
    };
    try {
      setIsLoading(true);
      const response = await client.post("/auth/verify", { data });
      console.log(response);
      if (response.data.status !== 200) {
        showToast("error", response.data.message);
        return;
      }

      showToast("success", response.data.message);

      setToggle(false);

      // Gọi API login lại để lấy tokens
      const loginData = {
        email: emailInput,
        password: document.querySelector('input[name="password"]').value, // Lấy password từ form
      };

      const loginResponse = await client.post("/auth/login", loginData);
      console.log("Login after OTP verify:", loginResponse);

      if (loginResponse.data.status === 200) {
        console.log("đã đến được 64"); // ✅ Bây giờ sẽ chạy

        // Set tokens
        await setToken(
          loginResponse.data.data.accessToken,
          loginResponse.data.data.refreshToken
        );

        // Redirect về trang chủ
        router.push("/");
      } else {
        showToast("error", "Đăng nhập thất bại sau khi verify OTP");
      }
    } catch (e) {
      console.log(e);
      showToast("error", "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gửi lại mã OTP
  const handleResendOTP = async (e) => {
    e.preventDefault();
    const data = {
      email: emailInput,
    };
    try {
      setIsLoading(true);
      const response = await client.post("/auth/resend-otp", data);
      console.log(response);
      if (response.data.status !== 200) {
        showToast("error", response.data.message);
        return;
      }
      showToast("success", response.data.message);
      showToast("info", "Mã OTP có thời hạn 60s");
    } catch (e) {
      console.log(e);
      showToast("error", "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e, index) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      if (index > 0) {
        inputRefs.current[index].value = "";
        inputRefs.current[index - 1].focus();
      }
      e.preventDefault();
    }
  };

  const handleInput = (e) => {
    const index = inputRefs.current.indexOf(e.target);
    if (e.target.value) {
      if (index < 4 - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get("email");
    try {
      const response = await client.post("/auth/check-email", { email });
      if (response.data.status !== 200) {
        showToast("error", response.data.message);
        return;
      }
      showToast("success", response.data.message, () => {
        Cookies.set("email_forgot", email, {
          expires: 1 / 24,
        });
        router.push("/forgot-password");
      });
    } catch (e) {
      console.log(e);
      showToast("error", response.data.message);
    }
  };

  const ScreenShotAnimation = memo(({ src }) => (
    <motion.div
      key={src}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 1.5, ease: "easeInOut" },
      }}
    >
      <Image src={src} alt="screen-shot" />
    </motion.div>
  ));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenShot((prev) => (prev + 1) % 4);
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Fragment>
      <div>
        {isLoading && <Loading />}
        <div className="relative ">
          <div
            className={clsx(
              "flex justify-center items-center",
              styles.container
            )}
          >
            <div className={clsx("", styles.container_image)}>
              <div
                className={clsx("m-auto mt-10 relative", styles.dynamic_image)}
              >
                <Image src={homePhone} alt="home_phone" priority />
                <div className="absolute flex justify-center items-center bottom-6 left-12 w-full h-full">
                  <AnimatePresence initial={false}>
                    <ScreenShotAnimation src={screenShots[currentScreenShot]} />
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <div className={clsx("", styles.box)}>
              <Link href="/login" className="mt-5">
                <Image
                  src={textLogo}
                  alt="text-logo"
                  style={{ maxWidth: "175px", maxHeight: "50px" }}
                  priority
                />
              </Link>
              <h1 className="text-gray-700 mt-3 mb-3">
                Đăng nhập để xem nhiều cái thú vị
              </h1>
              <form
                action=""
                className={clsx("w-full p-5 flex flex-col gap-3", styles.form)}
                onSubmit={handleLogin}
              >
                <div className="relative w-full min-w-[200px] h-10">
                  <input
                    className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-blue-500"
                    placeholder=" "
                    required
                    name="email"
                    type="email"
                  />
                  <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400 peer-focus:text-blue-500 before:border-blue-gray-200 peer-focus:before:!border-blue-500 after:border-blue-gray-200 peer-focus:after:!border-blue-500">
                    Email
                  </label>
                </div>

                <div className="relative w-full min-w-[200px] h-10">
                  <input
                    className="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2  focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-teal-500"
                    placeholder=" "
                    required
                    type="password"
                    name="password"
                  />
                  <label className="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400 peer-focus:text-teal-500 before:border-blue-gray-200 peer-focus:before:!border-teal-500 after:border-blue-gray-200 peer-focus:after:!border-teal-500">
                    Mật khẩu
                  </label>
                </div>

                <div
                  onClick={handleToggleForgot}
                  className="text-left text-blue-800 text-sm cursor-pointer"
                >
                  Quên mật khẩu?
                </div>

                <button
                  type="submit"
                  className="rounded-md w-full bg-blue-400 text-white p-2 text-xl"
                >
                  Đăng nhập
                </button>
                <div className="flex justify-center" style={{ width: "100%" }}>
                  <hr
                    style={{
                      width: "80%",
                    }}
                  />
                </div>
                <div className="flex justify-center ">
                  <Link href="/register" className="text-blue-600 text-sm">
                    Tạo tài khoản mới
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            © 2025 Instagram from Quoc Anh
          </p>
          {toggle && (
            <>
              <div
                style={{ zIndex: "500" }}
                className="  max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2    h-max"
              >
                <header className="mb-8">
                  <h1 className="text-2xl font-bold mb-1">
                    Xác minh tài khoản
                  </h1>
                  <p className="text-[15px] text-slate-500 overflow-hidden">
                    Vui lòng vào email <span>{hideEmail(emailInput)} </span>để
                    lấy mã xác minh
                  </p>
                </header>
                <form id="otp-form" onSubmit={handleConfirmOTP}>
                  <div className="flex items-center justify-center gap-3">
                    {/* <input
                      type="text"
                      className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      maxLength="1"
                      name="box_1"
                    />
                    <input
                      type="text"
                      className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      maxLength="1"
                      name="box_2"
                    />
                    <input
                      type="text"
                      className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      maxLength="1"
                      name="box_3"
                    />
                    <input
                      type="text"
                      className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      maxLength="1"
                      name="box_4"
                    /> */}
                    {[...Array(4)].map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength="1"
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onInput={handleInput}
                        onFocus={handleFocus}
                        ref={(el) => (inputRefs.current[index] = el)}
                        name={`box_${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="max-w-[260px] mx-auto mt-4">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150"
                    >
                      Xác nhận
                    </button>
                  </div>
                </form>
                <div className="text-sm text-slate-500 mt-4">
                  Chưa nhận được mã?{" "}
                  <button
                    onClick={handleResendOTP}
                    className="font-medium text-indigo-500 hover:text-indigo-600"
                  >
                    Gửi lại mã
                  </button>
                </div>
              </div>
              <div
                onClick={handleToggle}
                className="bg-gray-400 opacity-80 w-screen h-screen fixed inset-0"
              ></div>
            </>
          )}
          {toggleForgot && (
            <>
              <div
                style={{ zIndex: "600" }}
                className="w-full absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md mx-auto p-6"
              >
                <div className="mt-7 bg-white  rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
                  <div className="p-4 sm:p-7">
                    <div className="text-center">
                      <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                        Quên mật khẩu
                      </h1>
                    </div>

                    <div className="mt-5">
                      <form onSubmit={handleForgotPassword}>
                        <div className="grid gap-y-4">
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-bold ml-1 mb-2 dark:text-white"
                            >
                              Email của bạn
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                id="email"
                                name="email"
                                className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                required
                                placeholder="Email đã đăng ký của bạn"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                          >
                            Reset password
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div
                onClick={handleToggleForgot}
                className="bg-gray-400 opacity-80 w-screen h-screen fixed inset-0"
              ></div>
            </>
          )}
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
}
