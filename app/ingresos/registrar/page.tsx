"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CarTaxiFrontIcon as TaxiIcon,
  CalendarIcon,
  DollarSignIcon,
  FuelIcon as GasPumpIcon,
  PercentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Loader2Icon,
} from "lucide-react"
import Link from "next/link"

const RegistrarIngresoPage = () => {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [IngresoTotal, setIngresoTotal] = useState("")
  const [gastoGaso, setGastoGaso] = useState("")
  const [gastoComision, setGastoComision] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [ingresoNeto, setIngresoNeto] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIngresoNeto(null)
    setLoading(true)

    try {
      const response = await fetch("/api/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          IngresoTotal: Number(IngresoTotal),
          gastoGaso: Number(gastoGaso),
          gastoComision: Number(gastoComision),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registro guardado correctamente.")
        setIngresoNeto(data.IngresoNeto)
        setIngresoTotal("")
        setGastoGaso("")
        setGastoComision("")
        setTimeout(() => router.push("/home"), 1500)
      } else {
        setError(data.error || "Error al registrar. Intenta de nuevo.")
      }
    } catch {
      setError("Error de red. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Calculate preview of net income
  const calculatePreview = () => {
    if (IngresoTotal && gastoGaso && gastoComision) {
      const total = Number(IngresoTotal)
      const gaso = Number(gastoGaso)
      const comision = Number(gastoComision)
      return total - gaso - comision
    }
    return null
  }

  const previewNeto = calculatePreview()

  return (
    <div className="container py-10 max-w-md mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TaxiIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">TaxiTracker</h1>
        </div>
        <Link href="/home" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto">
            <ArrowLeftIcon className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Registrar Jornada
          </CardTitle>
          <CardDescription>Ingresa los detalles de tu jornada de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-primary bg-primary/10">
                <CheckCircleIcon className="h-4 w-4 text-primary" />
                <AlertDescription className="flex flex-col">
                  {success}
                  {ingresoNeto !== null && (
                    <span className="mt-2 font-semibold text-primary">Ingreso Neto: S/{ingresoNeto.toFixed(2)}</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fecha" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingreso" className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                Ingreso Total
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                <Input
                  id="ingreso"
                  type="number"
                  min={0}
                  step="0.01"
                  value={IngresoTotal}
                  onChange={(e) => setIngresoTotal(e.target.value)}
                  required
                  className="pl-7 focus-visible:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gastoGaso" className="flex items-center gap-2">
                <GasPumpIcon className="h-4 w-4 text-muted-foreground" />
                Gasto Gasolina
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                <Input
                  id="gastoGaso"
                  type="number"
                  min={0}
                  step="0.01"
                  value={gastoGaso}
                  onChange={(e) => setGastoGaso(e.target.value)}
                  required
                  className="pl-7 focus-visible:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gastoComision" className="flex items-center gap-2">
                <PercentIcon className="h-4 w-4 text-muted-foreground" />
                Gasto Comisión
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                <Input
                  id="gastoComision"
                  type="number"
                  min={0}
                  step="0.01"
                  value={gastoComision}
                  onChange={(e) => setGastoComision(e.target.value)}
                  required
                  className="pl-7 focus-visible:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>

            {previewNeto !== null && (
              <div className="mt-4 p-3 bg-accent rounded-md">
                <p className="text-sm text-muted-foreground">Vista previa:</p>
                <p className="text-lg font-semibold text-primary">Ingreso Neto: S/{previewNeto.toFixed(2)}</p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full gap-2" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                Registrar Jornada
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegistrarIngresoPage