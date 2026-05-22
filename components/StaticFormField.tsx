import type { ChangeEvent } from "react";

type Option = {
  label: string;
  value: string;
};

type StaticFormFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  icon?: string;
  options?: Option[];
  textarea?: boolean;
  rows?: number;
};

export default function StaticFormField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue = "",
  value,
  onChange,
  icon = "fas fa-pen",
  options,
  textarea = false,
  rows = 4,
}: StaticFormFieldProps) {
  const baseClass =
    "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10";

  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <i className={`${icon} text-[#1a5f3c]`}></i>
        {label}
      </span>

      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          className={baseClass}
        />
      ) : options ? (
        <select
          name={name}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          className={baseClass}
        >
          <option value="">{placeholder ?? "Wybierz"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={value === undefined ? defaultValue : undefined}
          value={value}
          onChange={onChange}
          className={baseClass}
        />
      )}
    </label>
  );
}
