import React from "react";
import styles from "./Spinner.module.css";

const Spinner: React.FC = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default Spinner;
