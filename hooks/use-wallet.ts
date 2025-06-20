```typescript
'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useCallback, useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface WalletState {
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  publicKey: PublicKey | null
  balance: number | null
  address: string | null
}

export interface WalletOperations {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendTransaction: (to: string, amount: number) => Promise<string | null>
  refreshBalance: () => Promise<void>
  signMessage: (message: string) => Promise<Uint8Array | null>
}

export function useWalletOperations(): WalletState & WalletOperations {
  const { connection } = useConnection()
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    connect: walletConnect,
    disconnect: walletDisconnect,
    sendTransaction: walletSendTransaction,
    signMessage: walletSignMessage,
  } = useWallet()

  const [balance, setBalance] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const address = publicKey?.toBase58() || null

  const refreshBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setBalance(null)
      return
    }

    try {
      setIsRefreshing(true)
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      toast.error('Failed to fetch wallet balance')
      setBalance(null)
    } finally {
      setIsRefreshing(false)
    }
  }, [publicKey, connection])

  const connect = useCallback(async () => {
    try {
      await walletConnect()
      toast.success('Wallet connected successfully')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }, [walletConnect])

  const disconnect = useCallback(async () => {
    try {
      await walletDisconnect()
      setBalance(null)
      toast.success('Wallet disconnected')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }, [walletDisconnect])

  const sendTransaction = useCallback(async (to: string, amount: number): Promise<string | null> => {
    if (!publicKey || !connection) {
      toast.error('Wallet not connected')
      return null
    }

    try {
      const toPublicKey = new PublicKey(to)
      const lamports = Math.round(amount * LAMPORTS_PER_SOL)

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPublicKey,
          lamports,
        })
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await walletSendTransaction(transaction, connection)
      
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      })

      toast.success(`Transaction sent: ${signature}`)
      await refreshBalance()
      
      return signature
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Transaction failed')
      return null
    }
  }, [publicKey, connection, walletSendTransaction, refreshBalance])

  const signMessage = useCallback(async (message: string): Promise<Uint8Array | null> => {
    if (!walletSignMessage) {
      toast.error('Wallet does not support message signing')
      return null
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signature = await walletSignMessage(encodedMessage)
      toast.success('Message signed successfully')
      return signature
    } catch (error) {
      console.error('Failed to sign message:', error)
      toast.error('Failed to sign message')
      return null
    }
  }, [walletSignMessage])

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance()
    } else {
      setBalance(null)
    }
  }, [connected, publicKey, refreshBalance])

  useEffect(() => {
    if (!connected || !publicKey) return

    const interval = setInterval(() => {
      if (!isRefreshing) {
        refreshBalance()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [connected, publicKey, refreshBalance, isRefreshing])

  return {
    connected,
    connecting,
    disconnecting,
    publicKey,
    balance,
    address,
    connect,
    disconnect,
    sendTransaction,
    refreshBalance,
    signMessage,
  }
}
```