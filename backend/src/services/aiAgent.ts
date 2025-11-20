export function assignTasksToWorkers(tasks: any[], workers: any[]) {
  // Greedy round-robin assignment
  if (!workers || workers.length === 0) return tasks.map(t => ({ ...t, assignedTo: null }))
  let wi = 0
  return tasks.map((t) => {
    const worker = workers[wi % workers.length]
    wi++
    return { ...t, assignedTo: worker.id }
  })
}
