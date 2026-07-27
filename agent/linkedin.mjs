// LinkedIn publishing via the versioned Posts API.
//
// Requires an OAuth access token with the `w_member_social` scope (and
// `openid`/`profile` if you want the agent to resolve your author URN
// automatically). See README.md for how to obtain one.

import { config } from "./config.mjs";

const API_BASE = "https://api.linkedin.com";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": config.linkedinApiVersion,
    "Content-Type": "application/json",
  };
}

// Resolve the posting identity. If LINKEDIN_AUTHOR_URN is set we trust it;
// otherwise we look the member up via the OpenID userinfo endpoint.
export async function resolveAuthorUrn(token) {
  if (process.env.LINKEDIN_AUTHOR_URN) return process.env.LINKEDIN_AUTHOR_URN;

  const res = await fetch(`${API_BASE}/v2/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Could not resolve author URN via /v2/userinfo (${res.status}). ` +
        `Set LINKEDIN_AUTHOR_URN explicitly, or grant the openid/profile ` +
        `scopes. Response: ${body}`,
    );
  }
  const { sub } = await res.json();
  return `urn:li:person:${sub}`;
}

// Publish a text post. Returns the created post's URN.
export async function publishPost(token, authorUrn, commentary) {
  const payload = {
    author: authorUrn,
    commentary,
    visibility: config.visibility,
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch(`${API_BASE}/rest/posts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn post failed (${res.status}): ${body}`);
  }

  // LinkedIn returns the new post URN in the x-restli-id / x-linkedin-id header.
  return (
    res.headers.get("x-restli-id") ||
    res.headers.get("x-linkedin-id") ||
    "(unknown urn)"
  );
}

// Delete a post you authored, by its URN (e.g. urn:li:share:123...).
export async function deletePost(token, postUrn) {
  const res = await fetch(
    `${API_BASE}/rest/posts/${encodeURIComponent(postUrn)}`,
    { method: "DELETE", headers: authHeaders(token) },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LinkedIn delete failed (${res.status}): ${body}`);
  }
  return true;
}
