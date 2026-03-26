"use client";

export function TextInput({ label, name, register, error, optional, placeholder, type = "text" }: any) {
  return (
    <div className="mb-4">
      <label className="form-label">{label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</label>
      <input type={type} className={`form-input ${error ? "border-red-400" : ""}`} placeholder={placeholder} {...register(name)} />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export function TextareaInput({ label, name, register, error, optional, placeholder, rows = 4 }: any) {
  return (
    <div className="mb-4">
      <label className="form-label">{label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</label>
      <textarea className={`form-textarea ${error ? "border-red-400" : ""}`} placeholder={placeholder} rows={rows} {...register(name)} />
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export function SelectInput({ label, name, register, options, error, optional, onChange }: any) {
  return (
    <div className="mb-4">
      <label className="form-label">{label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</label>
      <select className={`form-select ${error ? "border-red-400" : ""}`} {...register(name)} onChange={onChange}>
        <option value="">— Select —</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export function CheckboxGroup({ label, options, optional, values = [], onChange }: any) {
  const toggle = (opt: string, checked: boolean) =>
    onChange?.(checked ? [...values, opt] : values.filter((v: string) => v !== opt));
  return (
    <div className="mb-4">
      <label className="form-label">{label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</label>
      <div className="space-y-1.5 mt-1">
        {options.map((opt: string) => (
          <label key={opt} className="checkbox-item">
            <input type="checkbox" className="w-4 h-4 rounded" checked={values.includes(opt)} onChange={e => toggle(opt, e.target.checked)} />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function RadioGroup({ label, name, options, register, error, optional }: any) {
  return (
    <div className="mb-4">
      <label className="form-label">{label}{optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}</label>
      <div className="space-y-1.5 mt-1">
        {options.map((opt: string) => (
          <label key={opt} className="radio-item">
            <input type="radio" value={opt} className="w-4 h-4" {...register(name)} />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
