import React from "react";
import classNames from "classnames";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  const btnClass = classNames(
    styles.button,
    {
      [styles.primary]: variant === "primary",
      [styles.secondary]: variant === "secondary",
      [styles.danger]: variant === "danger"
    },
    className
  );
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
