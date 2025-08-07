import { connect, connection } from "mongoose";

const url = process.env.MONGODB_URI

type ConnectionState = {
    isConnected: boolean | number
}

const conn: ConnectionState = {
    isConnected: false
}

export const connectDb = async () => {

    if (conn.isConnected) return
    if (!url) throw new Error("MONGODB_URL is not defined");
    const db = await connect(url)

    conn.isConnected = db.connections[0].readyState
}

connection.on('connected', () => {
    console.log("connected")
})

connection.on('error', (error) => {
    console.log("error", error);
})


