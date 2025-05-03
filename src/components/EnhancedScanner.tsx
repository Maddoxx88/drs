import React, { useRef, useState } from "react";
import { exportCSV, exportJSON } from "../utils/exportHelpers";
import { parseRequirements, queryBatchOsv } from "../utils/osvApi";
import { EcosystemBadge } from "./EcoSystemBadge";
import { ScanCharts } from "./ScanCharts";
import { SecurityTips } from "./SecurityTips";

type TabType = "upload" | "paste" | "github";

export const EnhancedScanner = () => {
  const [includeDevDeps, setIncludeDevDeps] = useState(false);
  const [tab, setTab] = useState<TabType>("upload");
  const [inputText, setInputText] = useState("");
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [safePackages, setSafePackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [totalPackages, setTotalPackages] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [ecosystem, setEcosystem] = useState<"npm" | "PyPI" | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");


  const handleGitHubScan = async () => {
    setError("");
    setLoading(true);




    try {
      const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/;
      const match = githubUrl.match(regex);

      if (!match) {
        setError("Invalid GitHub repo URL.");
        setLoading(false);
        return;
      }

      const owner = match[1];
      const repo = match[2];
      const branch = githubBranch || "main";

      const tryFetchFile = async (filename: string) => {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
        const res = await fetch(url);
        if (res.ok) return await res.text();
        return null;
      };

      // Try package.json first
      let fileText = await tryFetchFile("package.json");
      if (fileText) {
        handleScan(fileText); // npm scan
        return;
      }

      // Try requirements.txt next
      fileText = await tryFetchFile("requirements.txt");
      if (fileText) {
        handleScan(fileText); // PyPI scan
        return;
      }

      setError(
        "No supported dependency files (package.json or requirements.txt) found in this repo."
      );
    } catch (err) {
      setError("Failed to fetch files from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (rawText: string) => {
    try {
      setError("");
      setVulnerabilities([]);
      setSafePackages([]);
      setLoading(true);

      let deps: Record<string, string> = {};
      let ecosystem: "npm" | "PyPI" = "npm";

      try {
        const json = JSON.parse(rawText);
        const baseDeps = json.dependencies || {};
        const devDeps = includeDevDeps ? json.devDependencies || {} : {};
        deps = { ...baseDeps, ...devDeps };

        if (Object.keys(deps).length === 0) {
          setError("No dependencies found in the provided JSON.");
          setLoading(false);
          return;
        }

        ecosystem = "npm";
        setEcosystem("npm"); // or "PyPI"
      } catch {
        // Not JSON? Try parsing as requirements.txt
        const parsedReqs = parseRequirements(rawText);

        if (parsedReqs.length === 0) {
          setError("No dependencies found in the provided text.");
          setLoading(false);
          return;
        }

        ecosystem = "PyPI";
        setEcosystem("PyPI"); // or "PyPI"

        for (const { name, version } of parsedReqs) {
          deps[name] = version || "latest"; // fallback for packages with no version specified
        }
      }

      const packagesToQuery = Object.entries(deps).map(([name, version]) => ({
        package: {
          name,
          ecosystem,
        },
        version: (version as string).replace(/^[^\d]*/, ""),
      }));
      
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

      const totalCount = vulns.length + safe.length;
      const riskScore =
        totalCount > 0 ? Math.round((vulns.length / totalCount) * 10) : 0;

      setTotalPackages(totalCount);
      setRiskScore(riskScore);
    } catch (err) {
      setError("Invalid file or unsupported format.");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const fileExtension = file.name.split(".").pop();
    if (fileExtension === "txt") {
      // parse as requirements.txt
    }
    handleScan(text);
  };

  const handlePasteScan = () => {
    if (!inputText.trim()) {
      setError("Please paste your package.json or requirements.txt content.");
      return;
    }

    handleScan(inputText); // use the new unified scanner!
  };

  const clearState = () => {
    setInputText("");
    setVulnerabilities([]);
    setSafePackages([]);
    setError("");
    setLoading(false);
    setTotalPackages(0);
    setRiskScore(0);
    setGithubUrl("");


    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">
        🔍 Dependency Risk Scanner
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            tab === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("upload")}
        >
          Upload File
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === "paste" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("paste")}
        >
          Paste Text
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === "github" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("github")}
        >
          Scan GitHub Repo
        </button>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={includeDevDeps}
            onChange={(e) => setIncludeDevDeps(e.target.checked)}
            className="accent-blue-600"
          />
          <span>
            Include <code>devDependencies</code>
          </span>
        </label>
      </div>

      {/* Upload or Paste */}
      {tab === "upload" && (
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json, .txt"
            onChange={handleFile}
            className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            onClick={clearState}
            className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      )}

      {tab === "paste" && (
        <div>
          <textarea
            rows={10}
            className="w-full border p-3 mb-2 rounded font-mono text-sm"
            placeholder="Paste your package.json or requirements.txt content here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="mt-2 flex space-x-3">
            <button
              onClick={handlePasteScan}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Scan Now
            </button>
            <button
              onClick={clearState}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

{tab === "github" && (
  <div className="space-y-2">
  <input
    type="text"
    placeholder="Paste GitHub repo URL (e.g. https://github.com/psf/requests)"
    value={githubUrl}
    onChange={(e) => setGithubUrl(e.target.value)}
    className="w-full border p-3 rounded"
  />
  <input
    type="text"
    placeholder="Branch name (default: main)"
    value={githubBranch}
    onChange={(e) => setGithubBranch(e.target.value)}
    className="w-full border p-3 rounded"
  />
  <div className="flex gap-3 mt-2">
    <button
      onClick={handleGitHubScan}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Scan Repo
    </button>
    <button
      onClick={clearState}
      className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
    >
      Clear
    </button>
  </div>
</div>

)}


      {!loading && totalPackages > 0 && (
        <ScanCharts
          riskScore={riskScore}
          total={totalPackages}
          vulnerable={vulnerabilities.length}
          safe={safePackages.length}
        />
      )}

      {/* Feedback */}
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {loading && <p className="mt-4">🔄 Scanning dependencies...</p>}

      {/* Results */}
      {!loading && vulnerabilities.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-red-700 mb-2">
            🚨 Vulnerabilities Found
          </h2>
          {vulnerabilities.map((item, i) => (
            <div
              key={i}
              className="bg-red-100 border border-red-300 p-3 mb-3 rounded"
            >
              <strong>
                {item.name}@{item.version}
              </strong>
              <ul className="list-disc ml-6 text-sm">
                {item.vulns.map((v: any, j: number) => (
                  <li key={j}>
                    {v.id}: {v.summary}
                    <a
                      href={v.references?.[0]?.url || "#"}
                      className="text-blue-600 ml-1 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      [details]
                    </a>
                  </li>
                ))}
              </ul>
              <strong>
                {item.name}@{item.version}
                {ecosystem && <EcosystemBadge type={ecosystem} />}
              </strong>
            </div>
          ))}
        </div>
      )}

      {!loading && (vulnerabilities.length > 0 || safePackages.length > 0) && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={() =>
              exportCSV(
                [...vulnerabilities, ...safePackages].map((pkg) => ({
                  name: pkg.name,
                  version: pkg.version,
                  vulnerabilities: pkg.vulns
                    ? pkg.vulns.map((v: any) => v.id).join("; ")
                    : "None",
                }))
              )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
          <button
            onClick={() =>
              exportJSON({
                ecosystem,
                total: totalPackages,
                riskScore,
                vulnerable: vulnerabilities,
                safe: safePackages,
              })
            }
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Export JSON
          </button>
        </div>
      )}

      {!loading && vulnerabilities.length === 0 && safePackages.length > 0 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded text-green-800">
          🎉 All dependencies are safe and up-to-date!
        </div>
      )}

      {!loading && safePackages.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold text-green-700 mb-2">
            ✅ Safe Packages
          </h2>
          <ul className="list-disc ml-6 text-sm">
            {safePackages.map((pkg, i) => (
              <li>
                {pkg.name}@{pkg.version}
                {ecosystem && <EcosystemBadge type={ecosystem} />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && totalPackages > 0 && <SecurityTips ecosystem={ecosystem} />}
    </div>
  );
};
