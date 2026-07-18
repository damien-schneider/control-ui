import { cacheLife } from "next/cache";

const controlUiRepositoryApiUrl = "https://api.github.com/repos/damien-schneider/control-ui";

function stargazersCountFrom(value: unknown) {
  if (typeof value !== "object" || value === null || !("stargazers_count" in value)) return null;
  const stargazersCount = value.stargazers_count;
  return typeof stargazersCount === "number" ? stargazersCount : null;
}

export async function getControlUiGitHubStars(): Promise<number | null> {
  "use cache";
  cacheLife("hours");

  try {
    const response = await fetch(controlUiRepositoryApiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "control-ui.dev",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) return null;

    const repository: unknown = await response.json();
    return stargazersCountFrom(repository);
  } catch {
    return null;
  }
}
