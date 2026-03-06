import { Resend } from "resend";

let _resend: Resend | null = null;

/** Lazily-initialized Resend client to avoid instantiation at import time. */
export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** Sender address configured via environment variable. */
export const emailFrom =
  process.env.EMAIL_FROM ?? "NextNest <noreply@nextnest.app>";
