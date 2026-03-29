import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ 
      status: "success", 
      message: "¡Conexión exitosa a Mongoose/MongoDB desde Next.js!" 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: "error", 
        message: "Error de conexión a la base de datos.", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
