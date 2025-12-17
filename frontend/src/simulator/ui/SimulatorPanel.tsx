// frontend/src/simulator/ui/SimulatorPanel.tsx
import { useSimStore } from "../store";

export default function SimulatorPanel() {
  const { auto, speed, logs, setAuto, setSpeed, triggerStep, clearLogs } =
    useSimStore();

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-xl border p-4 rounded-lg z-50">
      <h2 className="font-bold text-lg mb-2">Simulator</h2>

      <div className="space-y-3">

        {/* Auto toggle */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={auto}
            onChange={(e) => setAuto(e.target.checked)}
          />
          Auto Mode
        </label>

        {/* Speed */}
        <div>
          <label className="text-sm">Speed: {speed} ms</label>
          <input
            type="range"
            min={300}
            max={5000}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Manual Step */}
        <button
          className="bg-slate-900 text-white px-3 py-1 rounded"
          onClick={() => triggerStep()}
        >
          Run One Step
        </button>

        {/* Logs */}
        <div className="h-40 overflow-auto border p-2 text-xs bg-gray-50 rounded">
          {logs.map((l, idx) => (
            <div key={idx}>{l}</div>
          ))}
        </div>

        <button
          onClick={clearLogs}
          className="text-xs text-red-500 underline"
        >
          Clear logs
        </button>
      </div>
    </div>
  );
}
