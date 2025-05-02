import React, { useState } from "react";
import { queryOsv } from "../utils/osvApi";

export const FileUpload = () => {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const text = await file.text();
    const json = JSON.parse(text);

    const deps = json.dependencies || {};
    const results: any[] = [];

    for (const [name, version] of Object.entries(deps)) {
      const cleanVersion = (version as string).replace(/^[^\d]*/, "");
      const data = await queryOsv(name, cleanVersion);
      if (data.vulns?.length) {
        results.push({ name, version, vulns: data.vulns });
      }
    }

    setVulnerabilities(results);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <input
        type="file"
        accept=".json"
        onChange={handleFile}
        className="mb-4"
      />
      {loading && <p>Scanning dependencies...</p>}
      {!loading && vulnerabilities.length > 0 && (
        <div className="space-y-4">
          {vulnerabilities.map((item, i) => (
            <div key={i} className="border p-3 rounded bg-red-100">
              <strong>{item.name}@{item.version}</strong>
              <ul className="list-disc ml-6">
                {item.vulns.map((vuln: any, vi: number) => (
                  <li key={vi}>
                    {vuln.id}: {vuln.summary}
                    <a
                      href={vuln.references?.[0]?.url || "#"}
                      className="text-blue-600 underline ml-2"
                      target="_blank"
                    >[more]</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
