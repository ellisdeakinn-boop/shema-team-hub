import { Select } from "./ui";
import { TEAM } from "@/app/lib/team";

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  includeAnonymous?: boolean;
};

export function TeamSelect({ includeAnonymous = false, ...props }: Props) {
  return (
    <Select {...props}>
      <option value="">— Choose —</option>
      {includeAnonymous && <option value="">anonymous</option>}
      {TEAM.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
  );
}
