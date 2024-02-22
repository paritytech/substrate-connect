import fs from "node:fs/promises"
import path from "node:path"

const getFilePathsWithExtension = async (directory, extension, out = []) => {
  for (const file of await fs.readdir(directory)) {
    const filePath = path.join(directory, file)
    const stats = await fs.stat(filePath)
    if (stats.isDirectory())
      await getFilePathsWithExtension(filePath, extension, out)
    else if (stats.isFile() && file.endsWith(extension)) out.push(filePath)
  }
  return out
}

const MAX_SIZE = 1024 * 1024 * 4

for (const filePath of await getFilePathsWithExtension("dist", "js")) {
  const stats = await fs.stat(filePath)
  if (stats.size > MAX_SIZE)
    throw new Error(`${filePath} size is larger than 4MB`)
}
