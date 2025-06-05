import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Fix 1: Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params

    // Extract userId from cookie for authorization
    const cookie = request.headers.get('cookie')
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ingreso = await prisma.savings.findUnique({
      where: { id, userId }
    })

    if (!ingreso) {
      return NextResponse.json({ error: 'Ingreso no encontrado' }, { status: 404 })
    }

    return NextResponse.json(ingreso)
  } catch (error) {
    // Safe error logging to prevent serialization issues
    console.error('[INGRESOS_GET] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: String(error)
    })
    return NextResponse.json({ error: 'Error al obtener ingreso.' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { IngresoTotal, gastoGaso, gastoComision, fecha } = await request.json()
    
    // Fix 1: Await params before accessing properties
    const { id } = await params

    // Extract userId for authorization
    const cookie = request.headers.get('cookie')
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Calculate net income
    const IngresoNeto = Number(IngresoTotal) - Number(gastoGaso) - Number(gastoComision)

    // Fix 2: Convert date string to proper DateTime format for Prisma
    // This creates a DateTime at the start of the day in local timezone
    const fechaDateTime = new Date(fecha + 'T00:00:00.000Z')
    
    // Validate that the date conversion worked properly
    if (isNaN(fechaDateTime.getTime())) {
      return NextResponse.json({ error: 'Formato de fecha inválido' }, { status: 400 })
    }

    // Update the record in database
    const updated = await prisma.savings.update({
      where: { 
        id, 
        userId // Ensures user can only update their own records
      },
      data: {
        IngresoTotal: Number(IngresoTotal),
        gastoGaso: Number(gastoGaso),
        gastoComision: Number(gastoComision),
        IngresoNeto,
        fecha: fechaDateTime, // Now using proper DateTime format
      }
    })

    return NextResponse.json({ 
      message: 'Ingreso actualizado', 
      ingreso: updated 
    })
  } catch (error) {
    // Enhanced error logging with specific Prisma error handling
    console.error('[INGRESOS_PUT] Error occurred:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      errorString: String(error)
    })
    
    // Handle specific error types with user-friendly messages
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json({ 
          error: 'Ingreso no encontrado o no tienes permisos para editarlo' 
        }, { status: 404 })
      }
      
      if (error.message.includes('Invalid value for argument')) {
        return NextResponse.json({ 
          error: 'Datos inválidos. Verifica que todos los campos estén correctos.' 
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({ error: 'Error al actualizar ingreso.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Fix 1: Await params before accessing properties
    const { id } = await params

    // Extract userId for authorization
    const cookie = request.headers.get('cookie')
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1]

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.savings.delete({
      where: { 
        id, 
        userId // Ensure user can only delete their own records
      }
    })

    return NextResponse.json({ message: 'Ingreso eliminado' })
  } catch (error) {
    // Safe error logging
    console.error('[INGRESOS_DELETE] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorString: String(error)
    })
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ 
        error: 'Ingreso no encontrado o no tienes permisos para eliminarlo' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Error al eliminar ingreso.' }, { status: 500 })
  }
}