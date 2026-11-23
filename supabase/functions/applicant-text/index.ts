// Queues Clyde's heads-up text to a rental applicant when the HomeBase PM
// portal sends them the screening email (staff pressed "Send screening link").
//
// The portal (Vercel, project homebasepm) has no CommandBase credentials, so it
// calls this function with a shared secret instead. The text itself goes out
// through queue_text like every other text on Clyde's line, so quo-send applies
// the usual rules (quiet hours, opt-outs, the daily cap).
//
// The key is the tenant-application skill's own `app:<id>:screening-link`, so
// if Clyde also runs his Step 2 for the same person, nobody gets two texts.
//
// POST { applicationId, firstName, home, phone }
//   header x-applicant-text-secret: APPLICANT_TEXT_SECRET
// -> { status, id }   status is the outbound_texts status (queued, sent, ...)
import { createClient } from "jsr:@supabase/supabase-js@2";

const SECRET = Deno.env.get("APPLICANT_TEXT_SECRET") ?? "";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function sameSecret(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Names and homes come from a public form: keep them short and plain.
const clean = (s: unknown, max: number) =>
  String(s ?? "").replace(/[\r\n\t]+/g, " ").replace(/https?:\/\/\S+/gi, "").replace(/\s+/g, " ").trim().slice(0, max);

// "398 Live Oak Loop - SF" -> "398 Live Oak Loop". "Choose later" -> "".
function homeName(label: string) {
  if (!label || /^choose later/i.test(label)) return "";
  return label.replace(/\s+-\s+[A-Z0-9]{1,4}$/, "").trim();
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  if (!SECRET) return json(500, { error: "APPLICANT_TEXT_SECRET is not set" });
  if (!sameSecret(req.headers.get("x-applicant-text-secret") ?? "", SECRET)) return json(401, { error: "Not allowed" });

  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json(400, { error: "Bad JSON" }); }

  const id = String(input.applicationId ?? "");
  if (!UUID_RE.test(id)) return json(400, { error: "applicationId must be a uuid" });
  const digits = String(input.phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return json(400, { error: "No usable phone number" });
  const first = clean(input.firstName, 40);
  const home = homeName(clean(input.home, 80));

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // The first text to a number introduces Clyde; later ones don't.
  const { count } = await sb
    .from("outbound_texts")
    .select("id", { count: "exact", head: true })
    .eq("to_number", `+1${digits}`);
  const hi = first ? `Hi ${first}` : "Hi";
  const intro = count ? `${hi}, ` : `${hi}, this is Clyde with Cochrane Realty. `;
  const body = `${intro}${count ? "c" : "C"}ongrats, your rental application${home ? ` for ${home}` : ""} is pre-approved! ` +
    "The email with your screening link and the link to upload your proof of income is in your inbox now. " +
    "Text me here if you don't see it.";

  const { data, error } = await sb.rpc("queue_text", {
    p_to: digits,
    p_body: body,
    p_idempotency_key: `app:${id}:screening-link`,
    p_in_reply_to: null,
    p_reason: "tenant-application: Step 2 screening link (sent from the HomeBase PM portal)",
    p_allow_new_number: true,
    p_created_by: "homebase-portal",
  });
  if (error) return json(502, { error: error.message });
  return json(200, { status: data?.status ?? null, id: data?.id ?? null });
});
