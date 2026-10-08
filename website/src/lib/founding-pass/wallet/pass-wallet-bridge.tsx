'use client'

import { useEffect } from 'react'
import { registerPassWallet } from '../use-pass-wallet'
import * as passWalletConnection from './pass-wallet-connection'

/** Mounted by `PassWalletLoader` on demand: hands the loaded wallet module to the page (D-045). */
export function PassWalletBridge() {
  useEffect(() => registerPassWallet(passWalletConnection), [])
  return null
}
