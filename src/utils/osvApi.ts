export async function queryOsv(packageName: string, version: string) {
    const response = await fetch("https://api.osv.dev/v1/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: {
          name: packageName,
          ecosystem: "npm",
        },
        version,
      }),
    });
    return response.json();
  }
  