export type OSVEcosystem = "npm" | "PyPI";

export type OSVPackageQuery = {
  package: {
    name: string;
    ecosystem: OSVEcosystem;
  };
  version: string;
};

export type OSVVulnerability = {
  id: string;
  summary: string;
  severity?: {
    type: string;
    score: string;
  }[];
  references?: {
    type: string;
    url: string;
  }[];
};

export type OSVQueryBatchResponse = {
  results: {
    vulns?: OSVVulnerability[];
  }[];
};
