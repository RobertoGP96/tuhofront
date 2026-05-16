interface StatusStepperProps {
  /** Estado actual del trámite. */
  currentState: string;
  /** Lista ordenada de estados que forman el flujo principal. */
  flow: string[];
  /** Orden numérico para comparar avance (estados laterales pueden compartir orden). */
  flowOrder: Record<string, number>;
  /** Labels legibles por estado. */
  labels: Record<string, string>;
  /** Clases de color para el círculo de cada paso por estado. */
  colors: Record<string, string>;
  /** Estado "negativo" terminal (RECHAZADO/RECHAZADA) que sustituye al positivo. */
  rejectedState?: string;
  /** Estado lateral que destaca como alerta (REQUIERE_INFO). */
  warningState?: string;
  /** Texto a mostrar cuando se está en el `warningState`. */
  warningLabel?: string;
}

/**
 * Stepper visual reutilizable para mostrar el progreso de un trámite.
 *
 * Funciona para cualquier flujo definido por una lista ordenada de estados.
 * Soporta estados "negativos" (rechazos) y "laterales" (requiere info) que
 * no aparecen en el flow principal pero comparten el mismo nivel de avance.
 */
export function StatusStepper({
  currentState,
  flow,
  flowOrder,
  labels,
  colors,
  rejectedState,
  warningState,
  warningLabel,
}: StatusStepperProps) {
  const currentOrder = flowOrder[currentState] ?? 0;
  const isRejected = rejectedState !== undefined && currentState === rejectedState;
  const isWarning = warningState !== undefined && currentState === warningState;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />

        {flow.map((step, index) => {
          const stepOrder = flowOrder[step] ?? 0;
          const isActive = currentState === step;
          const isCompleted = currentOrder > stepOrder;
          // Si está rechazado y este es el paso "Aprobado", lo destacamos en rojo.
          const isRejectedAtThisStep = isRejected && stepOrder === flowOrder[rejectedState!];

          let circleClass = 'bg-gray-200 border-gray-300 text-gray-400';
          let stepLabel = labels[step] ?? step;

          if (isRejectedAtThisStep) {
            const rejectColor = colors[rejectedState!] ?? 'bg-red-500';
            circleClass = `${rejectColor} border-transparent text-white`;
            stepLabel = labels[rejectedState!] ?? stepLabel;
          } else if (isActive) {
            circleClass = `${colors[step] ?? 'bg-blue-500'} border-transparent text-white`;
          } else if (isCompleted) {
            circleClass = 'bg-primary-navy border-primary-navy text-white';
          }

          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${circleClass}`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className="mt-2 text-xs text-gray-500 text-center leading-tight max-w-[80px]">
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>

      {isWarning && warningLabel && (
        <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>{warningLabel}</span>
        </div>
      )}
    </div>
  );
}
