const isUndefined = (value?: unknown): value is undefined => {
  return typeof value === "undefined"
}

function eraseRecord<T>(
  record: Record<string, T>,
  cb?: (item: T) => void,
): void {
  Object.keys(record).forEach((key): void => {
    if (cb) {
      cb(record[key])
    }

    delete record[key]
  })
}

export { isUndefined, eraseRecord }
