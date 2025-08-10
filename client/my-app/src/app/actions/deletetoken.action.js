"use server";

import { cookies } from "next/headers";

export async function deleteToken() {
  const cookie = cookies();

  // console.log("exp: ", new Date(exp * 1000));
  cookie.delete("access_token");
  cookie.delete("refresh_token");
}
