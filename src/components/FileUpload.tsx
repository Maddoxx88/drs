import React, { useState } from "react";
import { parseRequirements, queryBatchOsv } from "../utils/osvApi";

export const FileUpload = () => {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [safePackages, setSafePackages] = useState<any[]>([]);
  const [totalPackages, setTotalPackages] = useState(0);  
  const [riskScore, setRiskScore] = useState(0);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const text = await file.text();
    const filename = file.name.toLowerCase();
  
    let deps: Record<string, string> = {};
    let ecosystem: "npm" | "PyPI" = "npm"; // default
  
    if (filename.endsWith("package.json")) {
      const json = JSON.parse(text);
      deps = json.dependencies || {};
      ecosystem = "npm";
    } else if (filename.endsWith("requirements.txt")) {
      const parsed = parseRequirements(text);
      parsed.forEach(({ name, version }) => {
        deps[name] = version || "latest";
      });
      ecosystem = "PyPI";
    } else {
      setError("Unsupported file type. Only package.json or requirements.txt are supported.");
      return;
    }
  
    setLoading(true);
    const packagesToQuery = Object.entries(deps).map(([name, version]) => ({
      package: {
        name,
        ecosystem, // now properly scoped
      },
      version: (version as string).replace(/^[^\d]*/, ""),
    }));
  
    try {
      const { results } = await queryBatchOsv(packagesToQuery);
  
      const vulns: any[] = [];
      const safe: any[] = [];
  
      results.forEach((result, index) => {
        const { package: { name }, version } = packagesToQuery[index];
        if (result.vulns?.length) {
          vulns.push({ name, version, vulns: result.vulns });
        } else {
          safe.push({ name, version });
        }
      });
  
      setVulnerabilities(vulns);
      setSafePackages(safe);
  
      const total = vulns.length + safe.length;
      const score = total > 0 ? Math.round((vulns.length / total) * 10) : 0;
  
      setTotalPackages(total);
      setRiskScore(score);
    } catch (err) {
      setError("Failed to scan file.");
    } finally {
      setLoading(false);
    }
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
              <strong>
                {item.name}@{item.version}
              </strong>
              <ul className="list-disc ml-6">
                {item.vulns.map((vuln: any, vi: number) => (
                  <li key={vi}>
                    {vuln.id}: {vuln.summary}
                    <a
                      href={vuln.references?.[0]?.url || "#"}
                      className="text-blue-600 underline ml-2"
                      target="_blank"
                    >
                      [more]
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {!loading && safePackages.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">✅ Safe Packages</h2>
          <ul className="list-disc ml-6 text-green-700">
            {safePackages.map((pkg, i) => (
              <li key={i}>
                {pkg.name}@{pkg.version}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loading && vulnerabilities.length === 0 && safePackages.length > 0 && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          🎉 All dependencies are safe and up-to-date!
        </div>
      )}
    </div>
  );
};
