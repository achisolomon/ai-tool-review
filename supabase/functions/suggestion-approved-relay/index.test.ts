import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { buildDispatchPayload, isApprovalTransition } from "./index.ts";

Deno.test("isApprovalTransition: true only when status becomes approved on a new_tool row", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "approved" },
    old_record: { status: "pending" },
  }), true);
});

Deno.test("isApprovalTransition: false when kind is not new_tool", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "tool_edit", status: "approved" },
    old_record: { status: "pending" },
  }), false);
});

Deno.test("isApprovalTransition: false when status was already approved", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "approved" },
    old_record: { status: "approved" },
  }), false);
});

Deno.test("isApprovalTransition: false when new status is not approved", () => {
  assertEquals(isApprovalTransition({
    record: { kind: "new_tool", status: "applied" },
    old_record: { status: "approved" },
  }), false);
});

Deno.test("buildDispatchPayload: reshapes into GitHub repository_dispatch shape", () => {
  const out = buildDispatchPayload({ record: { id: "abc-123", kind: "new_tool", status: "approved" } });
  assertEquals(out, {
    event_type: "suggestion-approved",
    client_payload: { suggestion_id: "abc-123" },
  });
});

Deno.test("isApprovalTransition: false when record is missing", () => {
  assertEquals(isApprovalTransition({
    record: undefined as any,
    old_record: { status: "pending" },
  }), false);
});
