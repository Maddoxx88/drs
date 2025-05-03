export async function queryOsv(name: string, version: string, ecosystem: "npm" | "PyPI") {
  const response = await fetch("https://api.osv.dev/v1/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: {
        name,
        ecosystem,
      },
      version,
    }),
  });

  return response.json();
}

  
  export function parseRequirements(text: string): { name: string; version: string | null }[] {
    const lines = text.split("\n");
    return lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const match = line.match(/^([a-zA-Z0-9_\-]+)([<>=!~]=?([\d\.]+))?/);
        return {
          name: match?.[1] || "",
          version: match?.[3] || null,
        };
      })
      .filter((entry) => entry.name);
  }
  