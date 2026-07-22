export class PerformanceProfiler {
  constructor() {
    this.marks = {};
    this.results = [];
    this.totalStart = performance.now();
  }

  start(label) {
    this.marks[label] = performance.now();
  }

  end(label) {
    if (this.marks[label]) {
      const duration = performance.now() - this.marks[label];
      this.results.push({ label, duration });
      delete this.marks[label];
    }
  }

  getResults() {
    return this.results;
  }

  getTotalDuration() {
    return performance.now() - this.totalStart;
  }

  printReport(title = "Performance Report") {
    console.log(`\n==================================================`);
    console.log(`${title}\n`);
    
    this.results.forEach(({ label, duration }) => {
      const paddedLabel = (label + " ").padEnd(30, ".");
      console.log(`${paddedLabel} ${Math.round(duration)} ms`);
    });

    console.log(`\n-----------------------------------------------`);
    const totalPadded = "TOTAL ".padEnd(30, ".");
    console.log(`${totalPadded} ${Math.round(this.getTotalDuration())} ms`);
    console.log(`==================================================\n`);
  }
}

// Dummy profiler to avoid null checks
export const dummyProfiler = {
  start: () => {},
  end: () => {},
  getResults: () => [],
  getTotalDuration: () => 0,
  printReport: () => {},
};
