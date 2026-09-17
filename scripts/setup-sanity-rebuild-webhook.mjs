/**
 * One-time setup: Sanity publish → Netlify rebuild (https://blank-co.uk).
 *
 * 1. Netlify → Site configuration → Build & deploy → Build hooks
 *    → Add build hook named “Sanity” on branch `main`
 *    → copy the URL (https://api.netlify.com/build_hooks/…)
 * 2. Sanity token that can manage webhooks (Developer/Admin):
 *    https://www.sanity.io/manage/project/w5usu9hl/api#tokens
 *
 * Usage:
 *   NETLIFY_BUILD_HOOK_URL=https://api.netlify.com/build_hooks/… \
 *   SANITY_AUTH_TOKEN=sk… \
 *   npm run setup:sanity-rebuild-webhook
 */

const projectId = process.env.SANITY_PROJECT_ID || "w5usu9hl";
const sanityToken = process.env.SANITY_AUTH_TOKEN;
const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
const apiVersion = "v2021-10-04";

const WEBHOOK_NAME = "Rebuild Netlify";
const LEGACY_WEBHOOK_NAMES = ["Rebuild GitHub Pages", WEBHOOK_NAME];
const DOCUMENT_TYPES = [
  "work",
  "talent",
  "about",
  "category",
  "landingPage",
  "workPage",
  "logo",
];

const hooksUrl = `https://${projectId}.api.sanity.io/${apiVersion}/hooks/projects/${projectId}`;

async function main() {
  if (!buildHookUrl?.startsWith("https://api.netlify.com/build_hooks/")) {
    console.error(
      "Missing NETLIFY_BUILD_HOOK_URL (Netlify → Build hooks → Add build hook).",
    );
    process.exit(1);
  }
  if (!sanityToken) {
    console.error(
      "Missing SANITY_AUTH_TOKEN (Sanity token that can manage webhooks).",
    );
    process.exit(1);
  }

  const listRes = await fetch(hooksUrl, {
    headers: { Authorization: `Bearer ${sanityToken}` },
  });
  if (!listRes.ok) {
    console.error(
      "Failed to list Sanity webhooks:",
      listRes.status,
      await listRes.text(),
    );
    process.exit(1);
  }

  const listed = await listRes.json();
  const hooks = Array.isArray(listed) ? listed : listed?.hooks || [];
  for (const hook of hooks) {
    if (!LEGACY_WEBHOOK_NAMES.includes(hook.name) || !hook.id) continue;
    const delRes = await fetch(`${hooksUrl}/${hook.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sanityToken}` },
    });
    if (!delRes.ok) {
      console.error(
        "Failed to delete old webhook:",
        delRes.status,
        await delRes.text(),
      );
      process.exit(1);
    }
    console.log(`Removed existing webhook ${hook.name} (${hook.id})`);
  }

  const body = {
    type: "document",
    name: WEBHOOK_NAME,
    description:
      "On publish, POSTs the Netlify build hook so blank-co.uk rebuilds with fresh content.",
    url: buildHookUrl,
    dataset: "production",
    httpMethod: "POST",
    apiVersion: "v2021-03-25",
    includeDrafts: false,
    rule: {
      on: ["create", "update", "delete"],
      filter: `_type in ${JSON.stringify(DOCUMENT_TYPES)}`,
      // Tiny payload — Netlify only needs the POST, not the document.
      projection: `{ok: true, _type}`,
    },
  };

  const createRes = await fetch(hooksUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sanityToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    console.error(
      "Failed to create webhook:",
      createRes.status,
      await createRes.text(),
    );
    process.exit(1);
  }

  const created = await createRes.json();
  console.log("Created Sanity webhook:", created.id || created.name || created);
  console.log(
    "Done. Publish any Work / Talent / About / Logo in Studio → Netlify should start a deploy.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
