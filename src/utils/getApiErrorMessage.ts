/**
 * Prefer field validation messages from `errors` over generic `message` (e.g. "Validation error").
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    data?: {
      message?: string;
      errors?: Record<string, string | string[] | Record<string, unknown>>;
    };
  };
  const data = e?.data;
  if (!data) return fallback;

  const errors = data.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const messages: string[] = [];
    for (const key of Object.keys(errors)) {
      const val = errors[key];
      if (Array.isArray(val)) {
        val.forEach((m) => {
          if (typeof m === "string" && m.trim()) messages.push(m);
        });
      } else if (typeof val === "string" && val.trim()) {
        messages.push(val);
      }
    }
    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  const msg = data.message;
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  return fallback;
}
