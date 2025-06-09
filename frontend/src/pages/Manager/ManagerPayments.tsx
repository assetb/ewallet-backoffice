import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchFilesStart,
  fetchFilesSuccess,
  fetchFilesFailure
} from "../../store/managerSlice";
import { fetchUploadedFiles, uploadFile } from "../../api/managerApi";
import Table from "../../components/Table/Table";
import Spinner from "../../components/Spinner/Spinner";
import Button from "../../components/Button/Button";
import { UploadedFileRecord } from "../../models/fileModels";
import { formatDate } from "../../utils/formatDate";
import { toast } from "react-toastify";

const ManagerPaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { uploadedFiles, loading, error } = useAppSelector(
    (state) => state.manager
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadFiles = async () => {
    dispatch(fetchFilesStart());
    try {
      const data = await fetchUploadedFiles();
      dispatch(fetchFilesSuccess(data));
    } catch (err: any) {
      dispatch(fetchFilesFailure(err.message));
      toast.error("Ошибка при загрузке списка файлов");
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Пожалуйста, выберите файл");
      return;
    }
    try {
      await uploadFile(selectedFile);
      toast.success("Файл успешно загружен");
      setTimeout(() => {
        loadFiles();
      }, 500);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Ошибка при загрузке файла"
      );
    }
  };

  return (
    <div>
      <h2>Загрузка платежей (Менеджер)</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".csv, .xml"
        />
        <Button onClick={handleUpload} style={{ marginLeft: "1rem" }}>
          Загрузить
        </Button>
      </div>

      {loading && <Spinner />}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Table<UploadedFileRecord>
        columns={[
          {
            header: "Имя файла",
            accessor: "fileName"
          },
          {
            header: "Дата",
            accessor: "date",
            render: (value) => formatDate(value)
          },
          {
            header: "Статус",
            accessor: "status"
          },
          {
            header: "Загружено",
            accessor: "uploadedCount"
          },
          {
            header: "Ошибок",
            accessor: "errorCount"
          }
        ]}
        data={uploadedFiles}
        getRowKey={(row) => row.fileName}
      />
    </div>
  );
};

export default ManagerPaymentsPage;
