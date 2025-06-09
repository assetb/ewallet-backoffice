import React from "react";
import styles from "./Select.module.css";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className,
  ...props
}) => {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <select className={styles.select} {...props}>
        <option value="">— Выберите —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default Select;
