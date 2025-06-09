import axios from "axios";
import { UploadedFileRecord } from "../models/fileModels";

export async function fetchUploadedFiles() {
  const resp = await axios.get<UploadedFileRecord[]>("/api/manager/uploaded-files");
  return resp.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const resp = await axios.post("/api/manager/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return resp.data;
}
