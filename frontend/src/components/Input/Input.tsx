import React, { forwardRef, InputHTMLAttributes } from "react";
import classNames from "classnames";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Оборачиваем в forwardRef и кладём ref на сам <input>
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={classNames(styles.input, className)}
          {...props}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
