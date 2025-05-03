type Props = { type: "npm" | "PyPI" };

export const EcosystemBadge = ({ type }: Props) => {
  return (
    <span
      className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
        type === "npm"
          ? "bg-green-100 text-green-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {type === "npm" ? "npm" : "PyPI"}
    </span>
  );
};
