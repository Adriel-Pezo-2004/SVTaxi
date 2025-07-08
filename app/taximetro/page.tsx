"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GaugeIcon as TaximetroIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  Loader2Icon,
  RouteIcon,
  CalendarIcon
} from "lucide-react"
import Link from "next/link"

const RegistrarTaximetroPage = () => {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [kmrecord, setKmrecord] = useState<string>("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    const kmValue = parseFloat(kmrecord)
    if (isNaN(kmValue) || kmValue <= 0) {
      setError("Por favor ingresa un valor numérico válido mayor a 0")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/taximetro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          kmrecord: kmValue,
          fecha // ENVÍA LA FECHA TAL CUAL LA SELECCIONA EL USUARIO (YYYY-MM-DD)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Registro de kilómetros guardado correctamente.")
        setKmrecord("")
        setFecha(new Date().toISOString().slice(0, 10))
        setTimeout(() => router.push("/home"), 1500)
      } else {
        setError(data.error || "Error al registrar. Intenta de nuevo.")
      }
    } catch (err) {
      setError("Error de red. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setKmrecord(value)
    }
  }

  return (
    <div className="container py-10 max-w-md mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TaximetroIcon className="h-8 w-8 text-primary" />
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
            <RouteIcon className="h-5 w-5 text-primary" />
            Registrar Kilometraje
          </CardTitle>
          <CardDescription>Ingresa los kilómetros recorridos en tu jornada</CardDescription>
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
                <AlertDescription>{success}</AlertDescription>
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
              <Label htmlFor="kmrecord" className="flex items-center gap-2">
                <TaximetroIcon className="h-4 w-4 text-muted-foreground" />
                Kilómetros Recorridos
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">km</span>
                <Input
                  id="kmrecord"
                  type="text"
                  inputMode="decimal"
                  value={kmrecord}
                  onChange={handleKmChange}
                  required
                  className="pl-10 focus-visible:ring-primary"
                  placeholder="0.0"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={handleSubmit} 
            className="w-full gap-2" 
            disabled={loading || !kmrecord}
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
                Registrar Kilometraje
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegistrarTaximetroPage