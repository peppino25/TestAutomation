async function fetchLatestRelease(user, repo) {
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}/releases`);
    if (!res.ok) throw new Error("Could not fetch releases");

    const data = await res.json();

    const release = data[0];

    return {
        version: release.tag_name,
        name: release.name,
        notes: release.body,
        url: release.html_url
    };
}


export async function checkForUpdates(localVersion, user, repo) {
    try {
        const latest = await fetchLatestRelease(user, repo);

        if (latest.version.replace("v", "") !== localVersion) {
            return latest;
        }

        return null;
    } catch (err) {
        console.error("Update check failed:", err);
        return null;
    }
}

