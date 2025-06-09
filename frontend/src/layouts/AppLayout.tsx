import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { useAuth } from "../hooks/useAuth";
import styles from "./AppLayout.module.css";

const AppLayout: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>ФП Приложение</div>
        <div className={styles.spacer}></div>
        {user && (
          <button className={styles.logout} onClick={handleLogout}>
            Выйти
          </button>
        )}
      </header>
      <div className={styles.main}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) =>
                  isActive ? styles.activeLink : styles.link
                }>
                Dashboard
              </NavLink>
            </li>
            {user?.role === "manager" && (
              <li>
                <NavLink to="/manager/payments" className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }>
                  Загрузка платежей
                </NavLink>
              </li>
            )}
            {user?.role === "finance" && (
              <li>
                <NavLink to="/finance/redemption" className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }>
                  Гашение ЭД
                </NavLink>
              </li>
            )}
            {user?.role === "supervisor" && (
              <li>
                <NavLink to="/supervisor/approvals" className={({ isActive }) =>
                    isActive ? styles.activeLink : styles.link
                  }>
                  Подтверждение гашения
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <section className={styles.content}>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default AppLayout;
