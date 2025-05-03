type Props = {
    ecosystem: "npm" | "PyPI" | null;
  };
  
  export const SecurityTips = ({ ecosystem }: Props) => {
    if (!ecosystem) return null;
  
    const tips = {
      npm: [
        "Run `npm audit fix` regularly.",
        "Use `npm ci` for reproducible builds.",
        "Avoid installing packages globally unless necessary.",
        "Enable 2FA for your npm account.",
      ],
      PyPI: [
        "Run `pip-audit` to check for vulnerabilities.",
        "Use a virtual environment (`venv`, `pipenv`, or `poetry`).",
        "Pin exact versions in `requirements.txt`.",
        "Check the integrity of downloaded wheels with hashes.",
      ],
    };
  
    return (
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🛡️ {ecosystem === "npm" ? "Node.js" : "Python"} Security Tips
        </h3>
        <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
          {tips[ecosystem].map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    );
  };
  