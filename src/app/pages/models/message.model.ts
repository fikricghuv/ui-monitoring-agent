import { ENUM_SENDER } from "../constants/enum.constant";


export class MessageModel
{
    message?: string;
    time?: string;
    sender?: ENUM_SENDER;
    room_id?: string;
}