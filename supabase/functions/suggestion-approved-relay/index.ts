// Reshapes a Supabase Database Webhook payload into GitHub's repository_dispatch
// shape and forwards it. Supabase cannot send client_payload directly from a
// webhook config, and the payload shapes don't match, so this exists purely to
// translate between the two — it holds no business logic of its own.

export interface WebhookPayload {
  record: { id?: string; kind?: string; status?: string };
  old_record?: { status?: string };
}

export function isApprovalTransition(payload: WebhookPayload): boolean {
  const { record, old_record } = payload;
  return (
    record.kind === "new_tool" &&
    record.status === "approved" &&
    old_record?.status !== "approved"
  );
}

export function buildDispatchPayload(payload: WebhookPayload) {
  return {
    event_type: "suggestion-approved",
    client_payload: { suggestion_id: payload.record.id },
  };
}

const GITHUB_OWNER = "achisolomon";
const GITHUB_REPO = "ai-tool-review";

Deno.serve(async (req: Request) => {
  const expectedSecret = Deno.env.get("WEBHOOK_SHARED_SECRET");
  const gotSecret = req.headers.get("x-webhook-secret");
  if (!expectedSecret || gotSecret !== expectedSecret) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload: WebhookPayload = await req.json();
  if (!isApprovalTransition(payload)) {
    return new Response("ignored: not an approval transition", { status: 200 });
  }

  const pat = Deno.env.get("GITHUB_PAT");
  if (!pat) {
    console.error("GITHUB_PAT secret is not configured");
    return new Response("server misconfigured", { status: 500 });
  }

  const dispatchRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(buildDispatchPayload(payload)),
    },
  );

  if (!dispatchRes.ok) {
    const body = await dispatchRes.text();
    console.error(`GitHub dispatch failed: ${dispatchRes.status} ${body}`);
    return new Response("dispatch failed", { status: 502 });
  }

  return new Response("dispatched", { status: 200 });
});
