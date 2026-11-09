import React, { useState } from "react";
import { Calculator, Delete, Equal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: number) => void;
  initialValue?: number;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialValue = 0,
}) => {
  const [display, setDisplay] = useState(initialValue ? initialValue.toString() : "0");

  const handleDigit = (digit: string) => {
    setDisplay((prev) => (prev === "0" ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setDisplay((prev) => {
      const lastChar = prev.slice(-1);
      if (["+", "-", "*", "/"].includes(lastChar)) {
        return prev.slice(0, -1) + op;
      }
      return prev + op;
    });
  };

  const handleClear = () => {
    setDisplay("0");
  };

  const handleBackspace = () => {
    setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  };

  const handleCalculate = (): number => {
    try {
      // Safe math evaluation
      const sanitized = display.replace(/[^0-9+\-*/.]/g, "");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      const num = Math.round(Number(result) || 0);
      setDisplay(num.toString());
      return num;
    } catch {
      return 0;
    }
  };

  const handleUseResult = () => {
    const finalResult = handleCalculate();
    onApply(finalResult);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4" /> Kalkulator Cepat
          </DialogTitle>
        </DialogHeader>

        {/* Display Screen */}
        <div className="rounded-md border bg-muted/50 p-3 text-right">
          <span className="text-2xl font-bold font-mono tracking-tight block truncate">
            {display}
          </span>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-2">
          <Button variant="outline" size="sm" onClick={handleClear} className="font-semibold text-destructive">
            C
          </Button>
          <Button variant="outline" size="sm" onClick={handleBackspace}>
            <Delete className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleOperator("/")} className="font-bold">
            ÷
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleOperator("*")} className="font-bold">
            ×
          </Button>

          {["7", "8", "9"].map((n) => (
            <Button key={n} variant="secondary" size="sm" onClick={() => handleDigit(n)} className="font-semibold">
              {n}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => handleOperator("-")} className="font-bold">
            -
          </Button>

          {["4", "5", "6"].map((n) => (
            <Button key={n} variant="secondary" size="sm" onClick={() => handleDigit(n)} className="font-semibold">
              {n}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => handleOperator("+")} className="font-bold">
            +
          </Button>

          {["1", "2", "3"].map((n) => (
            <Button key={n} variant="secondary" size="sm" onClick={() => handleDigit(n)} className="font-semibold">
              {n}
            </Button>
          ))}
          <Button variant="default" size="sm" onClick={handleCalculate} className="font-bold">
            <Equal className="h-4 w-4" />
          </Button>

          <Button variant="secondary" size="sm" onClick={() => handleDigit("0")} className="col-span-2 font-semibold">
            0
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDigit("000")} className="font-semibold text-xs">
            000
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDigit(".")} className="font-bold">
            .
          </Button>
        </div>

        <DialogFooter className="pt-2">
          <Button onClick={handleUseResult} className="w-full">
            Gunakan Nominal Ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
