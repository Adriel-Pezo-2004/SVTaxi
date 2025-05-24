"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CalculatorIcon } from "lucide-react"
import Link from "next/link"

export default function CalculadoraPage() {
  // Estados del formulario
  const [metaMensual, setMetaMensual] = useState("")
  const [diasTrabajo, setDiasTrabajo] = useState("")
  const [comision, setComision] = useState("")
  const [unidadConsumo, setUnidadConsumo] = useState("litros")
  const [consumo, setConsumo] = useState("")
  const [unidadPrecio, setUnidadPrecio] = useState("litro")
  const [precioCombustible, setPrecioCombustible] = useState("")
  const [kmUtilesDia, setKmUtilesDia] = useState("")
  const [factorBusqueda, setFactorBusqueda] = useState("")

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
  
  const kmRealesDia = (Number(kmUtilesDia) || 0) * (Number(factorBusqueda) || 1)
  const litrosDia = (consumoEnLitros100km / 100) * kmRealesDia
  const gastoGasDia = litrosDia * precioPorLitro
  const metaNetaDia = (Number(diasTrabajo) || 0) > 0 ? (Number(metaMensual) || 0) / Number(diasTrabajo) : 0
  const ingresoBrutoDia = (Number(comision) || 0) < 100 ? (metaNetaDia + gastoGasDia) / (1 - (Number(comision) || 0) / 100) : 0
  const comisionApp = ingresoBrutoDia * ((Number(comision) || 0) / 100)
  const precioKmUtil = (Number(kmUtilesDia) || 0) > 0 ? ingresoBrutoDia / Number(kmUtilesDia) : 0

  return (
    <div className="container py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <CalculatorIcon className="h-8 w-8 text-primary" />
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
          <CardTitle className="text-xl sm:text-2xl">Calculadora de Cobro Mínimo por Km</CardTitle>
          <CardDescription>
            Calcula el precio mínimo a cobrar por kilómetro útil para alcanzar tu meta mensual como taxista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 mb-6">
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

            {/* Kilómetros útiles */}
            <div>
              <Label>Kilómetros útiles por día</Label>
              <Input
                type="number"
                min={0}
                step="0.1"
                value={kmUtilesDia}
                onChange={(e) => setKmUtilesDia(e.target.value)}
                placeholder="Ej: 70"
              />
            </div>

            {/* Factor de búsqueda */}
            <div>
              <Label>Factor búsqueda de clientes</Label>
              <Input
                type="number"
                min={1}
                max={2}
                step="0.01"
                value={factorBusqueda}
                onChange={(e) => setFactorBusqueda(e.target.value)}
                placeholder="Ej: 1.15"
              />
              <span className="text-xs text-muted-foreground">1.15 = 15% adicional de km buscando clientes</span>
            </div>
          </form>

          {/* Resultados */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Días de trabajo:</span>
              <span>{diasTrabajo || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span>Meta neta diaria:</span>
              <span>S/ {metaNetaDia.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kilómetros reales por día:</span>
              <span>{kmRealesDia.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Litros diarios:</span>
              <span>{litrosDia.toFixed(2)} L</span>
            </div>
            <div className="flex justify-between">
              <span>Gasto gasolina diario:</span>
              <span>S/ {gastoGasDia.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ingreso bruto diario:</span>
              <span>S/ {ingresoBrutoDia.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Comisión app ({comision || "0"}%):</span>
              <span>S/ {comisionApp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary">
              <span>Cobro mínimo por km útil:</span>
              <span>S/ {precioKmUtil.toFixed(3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}