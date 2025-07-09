export class FileInfoModel 
{
  id?: string;
  uuid_file?: string;
  filename?: string;
  content_type?: string | null;
  size?: number;
  uploaded_at?: string;
  status?: string;
}