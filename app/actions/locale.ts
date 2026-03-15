"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/locale";

function getSafeRedirectTarget(value: string) {
  if (!value.startsWith("/")) {
    return "/";
  }

  return value;
}

export async function setLocaleAction(formData: FormData) {
  const localeValue = String(formData.get("locale") ?? "");
  const redirectTo = getSafeRedirectTarget(String(formData.get("redirectTo") ?? "/"));
  const nextLocale = isLocale(localeValue) ? localeValue : defaultLocale;
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, nextLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(redirectTo);
}
