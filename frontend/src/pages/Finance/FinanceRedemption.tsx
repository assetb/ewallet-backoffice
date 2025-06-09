import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchStart,
  fetchMerchantsSuccess,
  fetchRedemptionRequestsSuccess,
  fetchHistorySuccess,
  fetchBalanceSuccess,
  fetchFailure
} from "../../store/financeSlice";
import {
  fetchMerchants,
  fetchRedemptionRequests,
  fetchHistory,
  fetchBalance,
  createRedemptionRequest
} from "../../api/financeApi";
import Table from "../../components/Table/Table";
import Spinner from "../../components/Spinner/Spinner";
import Input from "../../components/Input/Input";
import Select from "../../components/Select/Select";
import Button from "../../components/Button/Button";
import { RedemptionRequest, HistoryRecord } from "../../models/requestModels";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface FormValues {
  merchantId: string;
  amount: number;
}

const schema = yup.object().shape({
  merchantId: yup.string().required("Выберите мерчанта"),
  amount: yup
    .number()
    .typeError("Введите сумму")
    .positive("Сумма должна быть положительной")
    .required("Сумма обязательна")
});

const FinanceRedemptionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { merchants, redemptionRequests, history, balance, loading, error } = useAppSelector(
    (state) => state.finance
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: yupResolver(schema)
  });

  const loadData = async () => {
    dispatch(fetchStart());
    try {
      const [merchs, requests, hist, bal] = await Promise.all([
        fetchMerchants(),
        fetchRedemptionRequests(),
        fetchHistory(),
        fetchBalance()
      ]);
      dispatch(fetchMerchantsSuccess(merchs));
      dispatch(fetchRedemptionRequestsSuccess(requests));
      dispatch(fetchHistorySuccess(hist));
      dispatch(fetchBalanceSuccess(bal));
    } catch (err: any) {
      dispatch(fetchFailure(err.message));
      toast.error("Ошибка при загрузке данных");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      const resp = await createRedemptionRequest(data.merchantId, data.amount);
      if (resp.success) {
        toast.success("Запрос на гашение успешно отправлен");
        reset();
        setTimeout(() => {
          loadData();
        }, 500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Ошибка при отправке запроса");
    }
  };

  return (
    <div>
      <h2>Функционал гашения (Финансист)</h2>

      {loading && <Spinner />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <strong>Баланс: </strong>
        {balance}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: "2rem" }}>
        <Select
          label="Мерчант"
          options={merchants.map((m) => ({
            value: m.merchantId,
            label: m.merchantName
          }))}
          {...register("merchantId")}
          error={errors.merchantId?.message}
        />
        <Input
          label="Сумма"
          type="number"
          step="0.01"
          {...register("amount")}
          error={errors.amount?.message}
        />
        <Button type="submit">Провести гашение</Button>
      </form>

      <h3>Текущие заявки на гашение</h3>
      <Table<RedemptionRequest>
        columns={[
          {
            header: "ID",
            accessor: "requestId"
          },
          {
            header: "Мерчант",
            accessor: "merchantId"
          },
          {
            header: "Сумма",
            accessor: "amount"
          },
          {
            header: "Дата/время",
            accessor: "dateTime",
            render: (val: string) => formatDate(val)
          },
          {
            header: "Статус",
            accessor: "status"
          }
        ]}
        data={redemptionRequests}
        getRowKey={(row) => row.requestId}
      />

      <h3>История гашений</h3>
      <Table<HistoryRecord>
        columns={[
          {
            header: "ID",
            accessor: "recordId"
          },
          {
            header: "Мерчант",
            accessor: "merchantId"
          },
          {
            header: "Сумма",
            accessor: "amount"
          },
          {
            header: "Дата/время",
            accessor: "dateTime",
            render: (val: string) => formatDate(val)
          }
        ]}
        data={history.filter((h) => h.type === "REDEMPTION")}
        getRowKey={(row) => row.recordId}
      />

      <h3>История эмиссий</h3>
      <Table<HistoryRecord>
        columns={[
          {
            header: "ID",
            accessor: "recordId"
          },
          {
            header: "Мерчант",
            accessor: "merchantId"
          },
          {
            header: "Сумма",
            accessor: "amount"
          },
          {
            header: "Дата/время",
            accessor: "dateTime",
            render: (val: string) => formatDate(val)
          }
        ]}
        data={history.filter((h) => h.type === "EMISSION")}
        getRowKey={(row) => row.recordId}
      />
    </div>
  );
};

export default FinanceRedemptionPage;
