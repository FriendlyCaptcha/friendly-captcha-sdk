/** Returns window.performance.now() if it is available, otherwise returns 0 */
export function windowPerformanceNow() {
    const p = window.performance;
    return p ? p.now() : 0
}
