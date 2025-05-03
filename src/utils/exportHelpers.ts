export function exportJSON(data: any, filename = "scan-results.json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    downloadBlob(url, filename);
  }
  
  export function exportCSV(data: any[], filename = "scan-results.csv") {
    if (!data.length) return;
  
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${(val as string).replace(/"/g, '""')}"`)
        .join(",")
    );
  
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    downloadBlob(url, filename);
  }
  
  function downloadBlob(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  