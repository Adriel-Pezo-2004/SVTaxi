"use client"

import { useState } from "react"
import { Calculator, MapPin, Flag, Move } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CalculadoraSimple() {
  const [precioKm, setPrecioKm] = useState("")
  const [kmRecogida, setKmRecogida] = useState("")
  const [kmViaje, setKmViaje] = useState("")

  const calcularTotal = () => {
    const precio = parseFloat(precioKm) || 0
    const recogida = parseFloat(kmRecogida) || 0
    const viaje = parseFloat(kmViaje) || 0
    return precio * (recogida + viaje)
  }

  const total = calcularTotal()

  return (
    <div className="container py-8 max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Calculadora de Tarifa</CardTitle>
              <p className="text-sm text-muted-foreground">Cálculo por kilómetro recorrido</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {/* Precio por km */}
            <div className="space-y-2">
              <Label htmlFor="precio-km">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  <span>Precio por kilómetro (S/)</span>
                </div>
              </Label>
              <Input
                id="precio-km"
                type="number"
                min="0"
                step="0.01"
                value={precioKm}
                onChange={(e) => setPrecioKm(e.target.value)}
                placeholder="Ej: 1.50"
              />
            </div>

            {/* Kilómetros de recogida */}
            <div className="space-y-2">
              <Label htmlFor="km-recogida">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Km para recoger al pasajero</span>
                </div>
              </Label>
              <Input
                id="km-recogida"
                type="number"
                min="0"
                step="0.1"
                value={kmRecogida}
                onChange={(e) => setKmRecogida(e.target.value)}
                placeholder="Ej: 2.5"
              />
            </div>

            {/* Kilómetros del viaje */}
            <div className="space-y-2">
              <Label htmlFor="km-viaje">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  <span>Km reales del viaje</span>
                </div>
              </Label>
              <Input
                id="km-viaje"
                type="number"
                min="0"
                step="0.1"
                value={kmViaje}
                onChange={(e) => setKmViaje(e.target.value)}
                placeholder="Ej: 8.3"
              />
            </div>

            {/* Resultado */}
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a cobrar:</span>
                <div className="text-2xl font-bold text-primary">
                  S/ {total.toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {kmRecogida || 0} km recogida + {kmViaje || 0} km viaje
              </div>
            </div>

            {/* Fórmula */}
            <div className="text-xs text-muted-foreground text-center">
              Fórmula: (Km recogida + Km viaje) × Precio/km
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}