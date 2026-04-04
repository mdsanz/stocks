'use server'

import { connectToDatabase } from "@/database/mongoose"

export const getAllUsersForNewsEmail = async () => {
    try {
        const mongoose = await connectToDatabase()
        const db = mongoose.connection.db;

        if (!db) throw new Error('Database not connected')

        const users = await db.collection('user').find(
            { 
                email: { $exists: true, $ne: null },
                subscribedToDailyDigest: true 
            },
            { projection: { _id: 1, id: 1, email: 1 } }
        ).toArray()

        return users.map((user) => ({
            id: user.id || user._id?.toString() || '',
            email: user.email
        }))
    } catch (error) {
        console.error('Error fetching users for news email:', error)
        throw error;
    }
}