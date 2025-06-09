import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchStart,
  fetchPendingRequestsSuccess,
  fetchHistorySuccess,
  fetchBalanceSuccess,
  fetchFailure
} from "../../store/supervisorSlice";
import {
  fetchPendingRequests,
  fetchHistory,
  fetchBalance,
  confirmRedemption
} from "../../api/supervisorApi";
import Table from "../../components/Table/Table";
import Spinner from "../../components/Spinner/Spinner";
import Button from "../../components/Button/Button";
import { RedemptionRequest, HistoryRecord } from "../../models/requestModels";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";

const SupervisorApprovalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pendingRequests, history, balance, loading, error } = useAppSelector(
    (state) => state.supervisor
  );

  const loadData = async () => {
    dispatch(fetchStart());
    try {
      const [requests, hist, bal] = await Promise.all([
        fetchPendingRequests(),
        fetchHistory(),
        fetchBalance()
      ]);
      dispatch(fetchPendingRequestsSuccess(requests));
      dispatch(fetchHistorySuccess(hist));
      dispatch(fetchBalanceSuccess(bal));
    } catch (err: any) {
      dispatch(fetchFailure(err.message));
      toast.error(err.response?.data?.message ?? "Ошибка при загрузке данных");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirm = async (requestId: string) => {
    try {
      const resp = await confirmRedemption(requestId);
      if (resp.success) {
        toast.success("Гашение подтверждено");
        setTimeout(() => {
          loadData();
        }, 500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Ошибка при подтверждении");
    }
  };

  return (
    <div>
      <h2>Функционал гашения (Руководитель)</h2>

      {loading && <Spinner />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <strong>Баланс: </strong>
        {balance}
      </div>

      <h3>Запросы на гашение</h3>
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
          },
          {
            header: "Действие",
            accessor: "requestId",
            render: (val: string) => (
              <Button variant="primary" onClick={() => handleConfirm(val)}>
                Подтвердить
              </Button>
            )
          }
        ]}
        data={pendingRequests}
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

export default SupervisorApprovalsPage;
