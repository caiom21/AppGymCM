type State = "closed" | "open" | "half-open"

export class CircuitBreaker {
  private state:       State = "closed"
  private failures:    number = 0
  private lastFailure: number = 0

  constructor(
    private threshold:  number = 5,   // falhas antes de abrir (SDD v5: 5 failures)
    private timeout:    number = 30000 // ms antes de tentar novamente
  ) {}

  async call<T>(fn: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = "half-open"       // testa novamente
      } else {
        return await fallback()              // usa cache sem tentar API
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      return await fallback()
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state    = "closed"
  }

  private onFailure() {
    this.failures++
    this.lastFailure = Date.now()
    if (this.failures >= this.threshold) {
      this.state = "open"
    }
  }
}
