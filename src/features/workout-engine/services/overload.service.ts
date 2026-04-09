export interface SeriesLog {
  exerciseId: string;
  setNumber: number;
  repsDone: number;
  repsTarget: number;
  loadKg: number;
  timestamp: string;
}

export interface OverloadResult {
  suggestedLoad: number;
  reason: string;
  confidence: "low" | "medium" | "high";
}

/**
 * Aplica a regra: 'Se taxa de conclusão >= 95% em 2 sessões seguidas, sugerir +2.5kg'.
 * Recebe o histórico das últimas 3 sessões (idealmente compiladas por média da sessão).
 */
export function calculateProgressiveOverload(
  history: SeriesLog[],
  currentLoadKg: number,
  targetReps: number
): OverloadResult {
  // Pegar apenas as últimas 3 sessões (ou logs representativos das sessões)
  const recentHistory = history.slice(-3);
  
  if (recentHistory.length < 2) {
    return { 
      suggestedLoad: currentLoadKg, 
      reason: "Histórico insuficiente (mínimo 2 sessões) para progressão automática.", 
      confidence: "low" 
    };
  }

  // Calcula taxa de conclusão das sessões recentes
  const completionRates = recentHistory.map(h => h.repsDone / targetReps);
  
  // Avalia as duas últimas consecutivas
  const last2Rates = completionRates.slice(-2);
  const consecutiveSuccess = last2Rates.every(r => r >= 0.95);

  if (consecutiveSuccess) {
    return {
      suggestedLoad: currentLoadKg + 2.5,
      reason: "Taxa de conclusão >= 95% em 2 sessões seguidas. Sugerido aumento (+2.5kg).",
      confidence: "high"
    };
  }

  const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
  if (avgCompletion < 0.70) {
    return {
      suggestedLoad: Math.max(currentLoadKg - 2.5, 0),
      reason: "Volume sistematicamente abaixo do alvo. Sugerida redução de carga.",
      confidence: "medium"
    };
  }

  return { 
    suggestedLoad: currentLoadKg, 
    reason: "Manter carga para consolidação da técnica.", 
    confidence: "medium" 
  };
}
