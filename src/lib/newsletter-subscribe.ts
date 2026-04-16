export interface NewsletterSubscribePayload {
  email: string;
  first_name?: string;
  last_name?: string;
  conant_leadership?: boolean;
}

export interface NewsletterSubscribeResult {
  success: boolean;
  error?: string;
  message?: string;
  status?: string;
}

export async function submitNewsletterSubscription(
  payload: NewsletterSubscribePayload
): Promise<NewsletterSubscribeResult> {
  try {
    const res = await fetch("/api/subscribe.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      return {
        success: true,
        message: data.message,
        status: data.status,
      };
    }

    return {
      success: false,
      error: data?.error || "Subscription failed. Please try again.",
    };
  } catch {
    return {
      success: false,
      error: "Subscription service unavailable. Please try again.",
    };
  }
}
