"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import Link from "next/link"

export default function CalculadoraPage() {
  // Estados del formulario
  const [metaMensual, setMetaMensual] = useState("")
  const [diasTrabajo, setDiasTrabajo] = useState("")
  const [comision, setComision] = useState("")
  const [unidadConsumo, setUnidadConsumo] = useState("")
  const [consumo, setConsumo] = useState("")
  const [unidadPrecio, setUnidadPrecio] = useState("")
  const [precioCombustible, setPrecioCombustible] = useState("")
  const [kmViaje, setKmViaje] = useState("") // Km útiles del viaje
  const [kmRecogida, setKmRecogida] = useState("") // Km para recoger al cliente

  // Constantes de conversión
  const LITROS_POR_GALON = 3.78541

  // Funciones de conversión
  const convertirConsumoALitros = (valor: number, unidad: string) => {
    return unidad === "litros" ? valor : valor * LITROS_POR_GALON
  }

  const convertirPrecioALitro = (valor: number, unidad: string) => {
    return unidad === "litro" ? valor : valor / LITROS_POR_GALON
  }

  // Cálculos principales
  const consumoEnLitros100km = convertirConsumoALitros(Number(consumo) || 0, unidadConsumo)
  const precioPorLitro = convertirPrecioALitro(Number(precioCombustible) || 0, unidadPrecio)
  
  // 1. Cálculo de kilómetros reales
  const kmTotalPorViaje = (Number(kmViaje) || 0) + (Number(kmRecogida) || 0)
  
  // 2. Costos operativos
  const litrosPorKm = consumoEnLitros100km / 100 // Convertir de L/100km a L/km
  const costoPorKm = litrosPorKm * precioPorLitro // Costo real por km
  const gastoGasDia = costoPorKm * kmTotalPorViaje // Gasto total de gasolina
  
  // 3. Ingresos necesarios
  const metaNetaDia = (Number(diasTrabajo) || 0) > 0 ? (Number(metaMensual) || 0) / Number(diasTrabajo) : 0
  const ingresoBrutoDia = (Number(comision) || 0) < 100 ? (metaNetaDia + gastoGasDia) / (1 - (Number(comision) || 0) / 100) : 0
  const comisionApp = ingresoBrutoDia * ((Number(comision) || 0) / 100)
  
  // 4. Tarifas por km
  const costoRecogida = costoPorKm * (Number(kmRecogida) || 0)
  
  // El viaje paga su costo + el de recogida + ganancia
  const precioKmViaje = (Number(kmViaje) || 0) > 0 ? (ingresoBrutoDia + costoRecogida) / (Number(kmViaje) || 1) : 0
  
  // La recogida solo cubre su costo operativo (sin ganancia)
  const precioKmRecogida = costoPorKm * 0.8 // 20% de descuento por ser trayecto sin cliente
  
  // Precio promedio ponderado
  const precioKmTotal = kmTotalPorViaje > 0 ? (
    (precioKmViaje * (Number(kmViaje) || 0) + 
    precioKmRecogida * (Number(kmRecogida) || 0)) / 
    kmTotalPorViaje
  ) : 0

  return (
    <div className="container py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Calculadora Taxi</h1>
        </div>
        <Link href="/home" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Volver al Home
          </Button>
        </Link>
      </div>

      {/* Calculadora Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Calculadora de Tarifas por Kilómetro</CardTitle>
          <CardDescription>
            Calcula los precios por kilómetro considerando viaje, recogida y total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Columna 1 */}
            <div className="space-y-4">
              {/* Meta mensual */}
              <div>
                <Label>Meta neta mensual (S/)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={metaMensual}
                  onChange={(e) => setMetaMensual(e.target.value)}
                  placeholder="Ej: 3000"
                />
              </div>

              {/* Días de trabajo */}
              <div>
                <Label>Días de trabajo</Label>
                <Input
                  type="number"
                  min={1}
                  value={diasTrabajo}
                  onChange={(e) => setDiasTrabajo(e.target.value)}
                  placeholder="Ej: 20"
                />
              </div>

              {/* Comisión */}
              <div>
                <Label>Comisión app (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={comision}
                  onChange={(e) => setComision(e.target.value)}
                  placeholder="Ej: 15"
                />
              </div>

              {/* Kilómetros del viaje (útiles) */}
              <div>
                <Label>Km del viaje (con cliente)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={kmViaje}
                  onChange={(e) => setKmViaje(e.target.value)}
                  placeholder="Ej: 10"
                />
              </div>
            </div>

            {/* Columna 2 */}
            <div className="space-y-4">
              {/* Consumo de combustible */}
              <div>
                <Label>Consumo de combustible</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={consumo}
                    onChange={(e) => setConsumo(e.target.value)}
                    placeholder={`Ej: ${unidadConsumo === "litros" ? "12" : "3"}`}
                    className="flex-1"
                  />
                  <select
                    value={unidadConsumo}
                    onChange={(e) => setUnidadConsumo(e.target.value)}
                    className="px-3 py-2 rounded-md bg-background border border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="litros">L/100km</option>
                    <option value="galones">gal/100km</option>
                  </select>
                </div>
              </div>

              {/* Precio del combustible */}
              <div>
                <Label>Precio del combustible</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.001"
                    value={precioCombustible}
                    onChange={(e) => setPrecioCombustible(e.target.value)}
                    placeholder={`Ej: ${unidadPrecio === "litro" ? "3.897" : "14.75"}`}
                    className="flex-1"
                  />
                  <select
                    value={unidadPrecio}
                    onChange={(e) => setUnidadPrecio(e.target.value)}
                    className="px-3 py-2 rounded-md bg-background border border-input ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="litro">S/ por litro</option>
                    <option value="galon">S/ por galón</option>
                  </select>
                </div>
              </div>

              {/* Kilómetros de recogida */}
              <div>
                <Label>Km para recoger cliente</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={kmRecogida}
                  onChange={(e) => setKmRecogida(e.target.value)}
                  placeholder="Ej: 5"
                />
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-lg">Resumen diario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span>Meta neta diaria:</span>
                  <span className="font-medium">S/ {metaNetaDia.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kilómetros totales:</span>
                  <span className="font-medium">{kmTotalPorViaje.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo por km:</span>
                  <span className="font-medium">S/ {costoPorKm.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gasto gasolina:</span>
                  <span className="font-medium">S/ {gastoGasDia.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingreso bruto:</span>
                  <span className="font-medium">S/ {ingresoBrutoDia.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisión app ({comision || "0"}%):</span>
                  <span className="font-medium">S/ {comisionApp.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Tarifas por kilómetro</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tarifa viaje */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Viaje con cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      S/ {precioKmViaje.toFixed(3)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {kmViaje || 0} km × {precioKmViaje.toFixed(3)} = S/ {(Number(kmViaje) * precioKmViaje).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                {/* Tarifa recogida */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recogida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      S/ {precioKmRecogida.toFixed(3)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {kmRecogida || 0} km × {precioKmRecogida.toFixed(3)} = S/ {(Number(kmRecogida) * precioKmRecogida).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                {/* Tarifa total */}
                <Card className="bg-primary/5 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tarifa total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      S/ {precioKmTotal.toFixed(3)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {kmTotalPorViaje.toFixed(1)} km × {precioKmTotal.toFixed(3)} = S/ {(kmTotalPorViaje * precioKmTotal).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Nota: La tarifa de recogida cubre solo el costo operativo (80% del costo por km).</p>
                <p>El viaje con cliente incluye los costos de operación + ganancia.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}