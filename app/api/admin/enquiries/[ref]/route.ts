import { adminRoute, fail, ok } from "@/lib/admin/api";
import { ENQUIRY_STATUSES, deleteEnquiry, setEnquiryStatus, type EnquiryStatus } from "@/lib/admin/enquiries";

type Ctx = RouteContext<"/api/admin/enquiries/[ref]">;

/** Update status: body { status: "new" | "in-progress" | "done" } */
export const PATCH = adminRoute(async (request: Request, ctx: Ctx) => {
  const { ref } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { status?: unknown };
  if (!ENQUIRY_STATUSES.includes(body.status as EnquiryStatus)) return fail(422, "Invalid status.");
  if (!(await setEnquiryStatus(ref, body.status as EnquiryStatus))) return fail(404, "Enquiry not found.");
  return ok();
});

export const DELETE = adminRoute(async (_request: Request, ctx: Ctx) => {
  const { ref } = await ctx.params;
  if (!(await deleteEnquiry(ref))) return fail(404, "Enquiry not found.");
  return ok();
});
