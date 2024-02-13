import { argon2id } from "@noble/hashes/argon2"
import { webcrypto } from "crypto"

// https://argon2-cffi.readthedocs.io/en/stable/api.html#module-argon2.profiles
// python -m argon2 --profile RFC_9106_LOW_MEMORY
const ARAGON_2ID_ITERATIONS = 3
const ARAGON_2ID_MEMORY = 65536
const ARAGON_2ID_PARALLELISM = 4
const ARAGON_2ID_SALT_LEN = 16

export function encryptPassword(password: string | Uint8Array): Uint8Array {
  const salt = new Uint8Array(ARAGON_2ID_SALT_LEN)
  webcrypto.getRandomValues(salt)

  return argon2id(password, salt, {
    t: ARAGON_2ID_ITERATIONS,
    m: ARAGON_2ID_MEMORY,
    p: ARAGON_2ID_PARALLELISM,
  })
}
