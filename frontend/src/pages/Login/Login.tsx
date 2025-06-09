import React from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginRequest } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { toast } from "react-toastify";
import styles from "./Login.module.css";

interface LoginFormValues {
  login: string;
  password: string;
}

const schema = yup.object().shape({
  login: yup.string().required("Логин обязателен"),
  password: yup.string().required("Пароль обязателен")
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const resp = await loginRequest(data.login, data.password);
      login(resp.token, resp.user);
      let target = from;
      if (!target) {
        switch (resp.user.role) {
          case "manager":
            target = "/manager/payments";
            break;
          case "finance":
            target = "/finance/redemption";
            break;
          case "supervisor":
            target = "/supervisor/approvals";
            break;
          default:
            target = "/dashboard";
        }
      }
      navigate(target, { replace: true });
      toast.success("Успешный вход");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Ошибка входа");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Вход в систему</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Логин"
          {...register("login")}
          error={errors.login?.message}
        />
        <Input
          label="Пароль"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Button type="submit" variant="primary">
          Войти
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
