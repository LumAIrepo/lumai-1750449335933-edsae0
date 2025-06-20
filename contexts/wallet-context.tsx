```tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { WalletAdapter, WalletError } from '@solana/wallet-adapter-base'
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  CoinbaseWalletAdapter,
  SlopeWalletAdapter,
  SafePalWalletAdapter,
  BitpieWalletAdapter,
  BitgetWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinhubWalletAdapter,
  HuobiWalletAdapter,
  HyperPayWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OntoWalletAdapter,
  ParticleAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SolongWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
  XDEFIWalletAdapter
} from '@solana/wallet-adapter-wallets'

export interface WalletContextState {
  wallet: WalletAdapter | null
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  select: (walletName: string) => void
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendTransaction: (transaction: Transaction | VersionedTransaction, connection: Connection) => Promise<string>
  signTransaction: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(transactions: T[]) => Promise<T[]>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  wallets: WalletAdapter[]
}

const WalletContext = createContext<WalletContextState>({} as WalletContextState)

export const useWallet = (): WalletContextState => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
  autoConnect?: boolean
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ 
  children, 
  autoConnect = false 
}) => {
  const [wallet, setWallet] = useState<WalletAdapter | null>(null)
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const wallets: WalletAdapter[] = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new SolletWalletAdapter(),
    new MathWalletAdapter(),
    new TokenPocketWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new SlopeWalletAdapter(),
    new SafePalWalletAdapter(),
    new BitpieWalletAdapter(),
    new BitgetWalletAdapter(),
    new CloverWalletAdapter(),
    new Coin98WalletAdapter(),
    new CoinhubWalletAdapter(),
    new HuobiWalletAdapter(),
    new HyperPayWalletAdapter(),
    new KeystoneWalletAdapter(),
    new KrystalWalletAdapter(),
    new NightlyWalletAdapter(),
    new NufiWalletAdapter(),
    new OntoWalletAdapter(),
    new ParticleAdapter(),
    new SalmonWalletAdapter(),
    new SkyWalletAdapter(),
    new SolongWalletAdapter(),
    new SpotWalletAdapter(),
    new TokenaryWalletAdapter(),
    new TrustWalletAdapter(),
    new WalletConnectWalletAdapter({
      network: 'mainnet-beta',
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id'
      }
    }),
    new XDEFIWalletAdapter()
  ]

  const select = (walletName: string) => {
    const selectedWallet = wallets.find(w => w.name === walletName)
    if (selectedWallet) {
      if (wallet) {
        wallet.removeAllListeners()
      }
      setWallet(selectedWallet)
      localStorage.setItem('walletName', walletName)
    }
  }

  const connect = async () => {
    if (!wallet) return

    try {
      setConnecting(true)
      await wallet.connect()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    if (!wallet) return

    try {
      setDisconnecting(true)
      await wallet.disconnect()
      localStorage.removeItem('walletName')
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
      throw error
    } finally {
      setDisconnecting(false)
    }
  }

  const sendTransaction = async (
    transaction: Transaction | VersionedTransaction,
    connection: Connection
  ): Promise<string> => {
    if (!wallet || !publicKey) {
      throw new Error('Wallet not connected')
    }

    try {
      return await wallet.sendTransaction(transaction, connection)
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  const signTransaction = async <T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      return await wallet.signTransaction(transaction)
    } catch (error) {
      console.error('Transaction signing failed:', error)
      throw error
    }
  }

  const signAllTransactions = async <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      return await wallet.signAllTransactions(transactions)
    } catch (error) {
      console.error('Multiple transaction signing failed:', error)
      throw error
    }
  }

  const signMessage = async (message: Uint8Array): Promise<Uint8Array> => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      return await wallet.signMessage(message)
    } catch (error) {
      console.error('Message signing failed:', error)
      throw error
    }
  }

  useEffect(() => {
    if (!wallet) return

    const onConnect = () => {
      setPublicKey(wallet.publicKey)
      setConnected(wallet.connected)
      setConnecting(false)
    }

    const onDisconnect = () => {
      setPublicKey(null)
      setConnected(false)
      setDisconnecting(false)
    }

    const onError = (error: WalletError) => {
      console.error('Wallet error:', error)
      setConnecting(false)
      setDisconnecting(false)
    }

    wallet.on('connect', onConnect)
    wallet.on('disconnect', onDisconnect)
    wallet.on('error', onError)

    return () => {
      wallet.off('connect', onConnect)
      wallet.off('disconnect', onDisconnect)
      wallet.off('error', onError)
    }
  }, [wallet])

  useEffect(() => {
    if (autoConnect) {
      const savedWalletName = localStorage.getItem('walletName')
      if (savedWalletName) {
        const savedWallet = wallets.find(w => w.name === savedWalletName)
        if (savedWallet) {
          setWallet(savedWallet)
          savedWallet.connect().catch(console.error)
        }
      }
    }
  }, [autoConnect])

  const value: WalletContextState = {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    select,
    connect,
    disconnect,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    signMessage,
    wallets
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
```