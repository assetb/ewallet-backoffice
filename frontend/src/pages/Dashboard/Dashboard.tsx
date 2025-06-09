import React from "react";
import { useAppSelector } from "../../store";

const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <h2>Добро пожаловать, {user?.login}!</h2>
      <p>Ваша роль: <strong>{user?.role}</strong></p>
      <p>Выберите нужный пункт меню слева для начала работы.</p>
    </div>
  );
};

export default Dashboard;
