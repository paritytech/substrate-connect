import { Observable } from "rxjs"

let NOTIN = {}
export const continueWith =
  <I, O>(
    mapper: (input: I) => Observable<O>,
  ): ((source: Observable<I>) => Observable<I | O>) =>
  (source) =>
    new Observable((observer) => {
      let latestValue: I = NOTIN as I
      let subscription = source.subscribe({
        next(v) {
          observer.next((latestValue = v))
        },
        error(e) {
          observer.error(e)
        },
        complete() {
          if (latestValue === NOTIN) observer.complete()
          else subscription = mapper(latestValue).subscribe(observer)
        },
      })

      return () => {
        subscription.unsubscribe()
      }
    })
