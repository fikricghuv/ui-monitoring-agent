export interface AdminRoomDisplayModel {
    id: string; // Akan diisi dengan room_id dari ActiveRoomsListMessage
    user_id: string; // User ID terkait room
    name: string; // Akan diisi dengan display_name
    lastMessage: string; // Untuk tampilan di daftar room (akan diupdate)
    lastTimeMessage: string; // Untuk sorting di daftar room (akan diupdate)
    createdAt: string; // Waktu pembuatan room
    updatedAt: string; // Waktu update terakhir room (berguna untuk sorting awal)
}