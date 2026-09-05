export interface Message {
  id: number;
  body: string;
  sent_at: string;
  read_at: string | null;
  sender_id: number;
  sender: { id: number; name: string; mobile: string };
  conversation_id: number;
  attachments: {
    id: number;
    file_path: string;
    file_name: string;
    mime_type: string;
  }[];
}
