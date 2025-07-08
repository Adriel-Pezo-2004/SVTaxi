"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CarTaxiFrontIcon as TaxiIcon,
  PlusCircleIcon,
  CalendarIcon,
  DollarSignIcon,
  FuelIcon as GasPumpIcon,
  PercentIcon,
  Calculator,
  PencilIcon,
  CheckCircleIcon,
  XIcon,
  Loader2Icon
} from "lucide-react"
import Link from "next/link"

type Saving = {
  id: string
  fecha: string
  IngresoTotal: number
  gastoGaso: number
  gastoComision: number
  IngresoNeto: number
  userId: string
}
type TaximetroRecord = {
  id: string
  fecha: string
  kmrecord: number
  createdAt: string
  userId: string
}

export default function HomePage() {
  const [savings, setSavings] = useState<Saving[]>([])
  const [taximetroRecords, setTaximetroRecords] = useState<TaximetroRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({
    kilometers: 0,
    earnings: 0
  });
  const [editId, setEditId] = useState<string | null>(null)
  const [editKm, setEditKm] = useState<string>("")
  const [editError, setEditError] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const router = useRouter()

  const handleDeleteTaximetro = async (id: string) => {
    try {
      const response = await fetch(`/api/taximetro/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        const updatedTaximetroRecords = taximetroRecords.filter(t => t.id !== id)
        setTaximetroRecords(updatedTaximetroRecords)
        const totalKm = updatedTaximetroRecords.reduce((sum, r) => sum + Number(r.kmrecord), 0)
        const totalEarnings = savings.reduce((sum, s) => sum + Number(s.IngresoNeto), 0)
        setTotals({
          kilometers: totalKm,
          earnings: totalEarnings
        })
      }
    } catch (error) {
      console.error("Error deleting taximetro record:", error)
    }
  }

  const handleDeleteIngreso = async (id: string) => {
    try {
      const response = await fetch(`/api/ingresos/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        const updatedSavings = savings.filter(s => s.id !== id)
        setSavings(updatedSavings)
        const totalKm = taximetroRecords.reduce((sum, r) => sum + Number(r.kmrecord), 0)
        const totalEarnings = updatedSavings.reduce((sum, s) => sum + Number(s.IngresoNeto), 0)
        setTotals({
          kilometers: totalKm,
          earnings: totalEarnings
        })
      }
    } catch (error) {
      console.error("Error deleting record:", error)
    }
  }

  useEffect(() => {
    fetch("/api/home", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login")
          return
        }
        const data = await res.json()
        setSavings(data.savings || [])
        setTaximetroRecords(data.taximetroRecords || [])
        setTotals(data.totals || { kilometers: 0, earnings: 0 });
        setLoading(false)
      })
      .catch(() => {
        router.replace("/login")
      })
  }, [router])

  const handleEditClick = (record: TaximetroRecord) => {
    setEditId(record.id)
    setEditKm(record.kmrecord.toString())
    setEditError("")
  }

  const handleEditCancel = () => {
    setEditId(null)
    setEditKm("")
    setEditError("")
  }

  const handleEditSave = async () => {
    setEditError("")
    const kmValue = parseFloat(editKm)
    if (isNaN(kmValue) || kmValue <= 0) {
      setEditError("Por favor ingresa un valor numérico válido mayor a 0")
      return
    }
    setEditLoading(true)
    try {
      const response = await fetch(`/api/taximetro/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kmrecord: kmValue }),
      })
      const data = await response.json()
      if (response.ok) {
        const updatedTaximetroRecords = taximetroRecords.map((rec) =>
          rec.id === editId ? { ...rec, kmrecord: kmValue } : rec
        )
        setTaximetroRecords(updatedTaximetroRecords)
        const totalKm = updatedTaximetroRecords.reduce((sum, r) => sum + Number(r.kmrecord), 0)
        const totalEarnings = savings.reduce((sum, s) => sum + Number(s.IngresoNeto), 0)
        setTotals({
          kilometers: totalKm,
          earnings: totalEarnings
        })
        setEditId(null)
        setEditKm("")
      } else {
        setEditError(data.error || "Error al actualizar. Intenta de nuevo.")
      }
    } catch {
      setEditError("Error de red. Intenta de nuevo.")
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div className="container py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TaxiIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">TaxiTracker</h1>
          <Link href="/logout" className="block">
            <Button variant="outline" className="w-full mt-2">
              Cierra Sesión
            </Button>
          </Link>
        </div>
        <Link href="/ingresos/registrar" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <PlusCircleIcon className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </Link>
        <Link href="/calculadora" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Calculator className="h-4 w-4" />
            Calculadora
          </Button>
        </Link>
        <Link href="/cobro" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Calculator className="h-4 w-4" />
            Carrera
          </Button>
        </Link>
        <Link href="/taximetro" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <TaxiIcon className="h-4 w-4" />
            Taximetro
          </Button>
        </Link>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl sm:text-2xl">Resumen</CardTitle>
          <CardDescription>Tus estadísticas totales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 py-4 sm:py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">Ingreso Neto</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                S/{loading ? "..." : totals.earnings.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">Kilómetros</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {loading ? "..." : totals.kilometers.toFixed(1)} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Ingresos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <DollarSignIcon className="h-5 w-5 text-primary" />
              Historial de Ingresos
            </CardTitle>
            <CardDescription>Registro de tus jornadas de trabajo</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {savings.map((saving) => (
                  <div
                    key={saving.id}
                    className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-3 sm:p-4 border rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col mb-2 sm:mb-0">
                      <span className="font-medium flex items-center gap-2 text-sm sm:text-base">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(saving.fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSignIcon className="h-3 w-3" />S/{Number(saving.IngresoTotal).toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GasPumpIcon className="h-3 w-3" />S/{Number(saving.gastoGaso).toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <PercentIcon className="h-3 w-3" />S/{Number(saving.gastoComision).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base sm:text-lg text-primary">
                        S/{Number(saving.IngresoNeto).toFixed(2)}
                      </span>
                      <Link href={`/ingresos/editar/${saving.id}`}>
                        <Button size="icon" variant="ghost" aria-label="Editar">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteIngreso(saving.id)}
                        aria-label="Eliminar"
                      >
                        <XIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {savings.length === 0 && (
                  <div className="text-center py-8 sm:py-10 text-muted-foreground">
                    <p>No hay ingresos registrados.</p>
                    <p className="mt-2">Comienza registrando tu primera jornada.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">Mostrando {savings.length} registros</p>
          </CardFooter>
        </Card>

        {/* Card de Taxímetro */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <TaxiIcon className="h-5 w-5 text-primary" />
              Historial de Kilometraje
            </CardTitle>
            <CardDescription>Registro de tus recorridos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-md">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {taximetroRecords.map((taximetro) => (
                  <div
                    key={taximetro.id}
                    className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-3 sm:p-4 border rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="flex flex-col mb-2 sm:mb-0">
                      <span className="font-medium flex items-center gap-2 text-sm sm:text-base">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {new Date(taximetro.fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {editId === taximetro.id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                        <Label htmlFor="editKm" className="sr-only">Kilómetros</Label>
                        <Input
                          id="editKm"
                          type="number"
                          min={0}
                          step={0.1}
                          value={editKm}
                          onChange={e => setEditKm(e.target.value)}
                          className="w-24"
                          disabled={editLoading}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={handleEditSave}
                          disabled={editLoading}
                          aria-label="Guardar"
                        >
                          {editLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleEditCancel}
                          disabled={editLoading}
                          aria-label="Cancelar"
                        >
                          <XIcon className="h-4 w-4 text-destructive" />
                        </Button>
                        {editError && (
                          <span className="text-xs text-destructive ml-2">{editError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg text-primary">
                          {Number(taximetro.kmrecord).toFixed(1)} km
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(taximetro)}
                          aria-label="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTaximetro(taximetro.id)}
                          aria-label="Eliminar"
                        >
                          <XIcon className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {taximetroRecords.length === 0 && (
                  <div className="text-center py-8 sm:py-10 text-muted-foreground">
                    <p>No hay registros de kilometraje.</p>
                    <p className="mt-2">Registra tu primer recorrido.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">Mostrando {taximetroRecords.length} registros</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}