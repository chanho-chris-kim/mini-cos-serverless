import { useSimulatorStore } from "../lib/simulatorStore";

export default function SimulatorPanel() {
  const {
    running,
    speed,
    logs,
    start,
    stop,
    step,
    setSpeed,
  } = useSimulatorStore();

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-xl border border-slate-200 p-4 z-50">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-slate-800">Simulator</div>
        <div className="text-xs text-slate-500">
          Speed: {(speed / 1000).toFixed(1)}s
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {!running ? (
          <button
            onClick={start}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Start Auto
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Stop
          </button>
        )}

        <button
          onClick={step}
          className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded"
        >
          Run One
        </button>
      </div>

      {/* Speed slider */}
      <div className="mb-4">
        <input
          type="range"
          min={300}
          max={5000}
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Logs */}
      <div className="h-40 overflow-auto bg-slate-50 border border-slate-200 rounded p-2 text-xs whitespace-pre-wrap">
        {logs.length === 0 ? (
          <div className="text-slate-400">No simulator activity yet…</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="text-slate-700 mb-1">
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
