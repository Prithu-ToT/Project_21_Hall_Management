export default function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder
}) {
  // If placeholder is not provided, generate one from label
  const finalPlaceholder = placeholder ?? (label ? `Enter ${label}` : "");

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={finalPlaceholder}
      />
    </div>
  );
}