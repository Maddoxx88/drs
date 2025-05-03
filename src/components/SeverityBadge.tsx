type Props = {
  score: number;
};

export const SeverityBadge = ({ score }: Props) => {
  let color = "";
  let label = "";

  if (score >= 9) {
    label = "Critical";
    color = "bg-red-600 text-white";
  } else if (score >= 7) {
    label = "High";
    color = "bg-orange-500 text-white";
  } else if (score >= 4) {
    label = "Medium";
    color = "bg-yellow-400 text-black";
  } else {
    label = "Low";
    color = "bg-green-500 text-white";
  }

  return (
    <span
      className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium ${color}`}
    >
      {label} ({score})
    </span>
  );
};
