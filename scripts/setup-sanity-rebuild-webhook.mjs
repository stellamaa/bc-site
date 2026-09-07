/**
 * One-time setup: Sanity publish → GitHub Actions rebuild (GitHub Pages).
 *
 * Prerequisites:
 * 1. Push the updated `.github/workflows/nextjs.yml` (repository_dispatch) to main.
 * 2. GitHub Personal Access Token (classic) with `repo` scope:
 *    https://github.com/settings/tokens/new?scopes=repo&description=Sanity%20Pages%20rebuild
 * 3. Sanity token that can manage webhooks (Developer/Admin):
 *    https://www.sanity.io/manage/project/w5usu9hl/api#tokens
 *
 * Usage:
 *   GITHUB_REBUILD_TOKEN=ghp_... SANITY_AUTH_TOKEN=sk... npm run setup:sanity-rebuild-webhook
 */

const projectId = process.env.SANITY_PROJECT_ID || "w5usu9hl";
const githubRepo = process.env.GITHUB_REPO || "stellamaa/bc-site";
const githubToken = process.env.GITHUB_REBUILD_TOKEN;
const sanityToken = process.env.SANITY_AUTH_TOKEN;
const apiVersion = "v2021-10-04";

const WEBHOOK_NAME = "Rebuild GitHub Pages";
const EVENT_TYPE = "sanity-rebuild";

const hooksUrl = `https://${projectId}.api.sanity.io/${apiVersion}/hooks/projects/${projectId}`;

async function main() {
  if (!githubToken) {
    console.error("Missing GITHUB_REBUILD_TOKEN (GitHub PAT with repo scope).");
    process.exit(1);
  }
  if (!sanityToken) {
    console.error("Missing SANITY_AUTH_TOKEN (Sanity token that can manage webhooks).");
    process.exit(1);
  }

  const listRes = await fetch(hooksUrl, {
    headers: { Authorization: `Bearer ${sanityToken}` },
  });
  if (!listRes.ok) {
    console.error("Failed to list Sanity webhooks:", listRes.status, await listRes.text());
    process.exit(1);
  }

  const listed = await listRes.json();
  const hooks = Array.isArray(listed) ? listed : listed?.hooks || [];
  const existing = hooks.find((hook) => hook.name === WEBHOOK_NAME);
  if (existing?.id) {
    const delRes = await fetch(`${hooksUrl}/${existing.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sanityToken}` },
    });
    if (!delRes.ok) {
      console.error("Failed to delete old webhook:", delRes.status, await delRes.text());
      process.exit(1);
    }
    console.log(`Removed existing webhook ${existing.id}`);
  }

  const body = {
    type: "document",
    name: WEBHOOK_NAME,
    description:
      "On publish, triggers repository_dispatch sanity-rebuild so GitHub Pages rebuilds with fresh content.",
    url: `https://api.github.com/repos/${githubRepo}/dispatches`,
    dataset: "production",
    httpMethod: "POST",
    apiVersion: "v2021-03-25",
    includeDrafts: false,
    rule: {
      on: ["create", "update", "delete"],
      filter:
        '_type in ["work", "talent", "about", "category", "landingPage", "workPage"]',
      projection: `{"event_type":"${EVENT_TYPE}"}`,
    },
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
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
    console.error("Failed to create webhook:", createRes.status, await createRes.text());
    process.exit(1);
  }

  const created = await createRes.json();
  console.log("Created Sanity webhook:", created.id || created.name || created);
  console.log(
    "Done. Publish any Work/Talent/About in Studio → Actions should run “Deploy Next.js site to Pages”.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
