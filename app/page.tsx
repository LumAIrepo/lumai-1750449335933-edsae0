```tsx
'use client'

import { useState, useEffect } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface WalletAdapter {
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: PublicKey }>
      disconnect: () => Promise<void>
      on: (event: string, callback: () => void) => void
      publicKey: PublicKey | null
    }
  }
}

export default function WalletConnectPage() {
  const [wallet, setWallet] = useState<WalletAdapter>({
    publicKey: null,
    connected: false,
    connecting: false,
    connect: async () => {},
    disconnect: async () => {}
  })
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const connection = new Connection('https://api.mainnet-beta.solana.com')

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            setWallet(prev => ({
              ...prev,
              publicKey: response.publicKey,
              connected: true
            }))
          }
        } catch (error) {
          console.log('Wallet not connected')
        }
      }
    }

    checkWalletConnection()

    if (window.solana) {
      window.solana.on('connect', () => {
        if (window.solana?.publicKey) {
          setWallet(prev => ({
            ...prev,
            publicKey: window.solana!.publicKey,
            connected: true,
            connecting: false
          }))
          toast.success('Wallet connected successfully!')
        }
      })

      window.solana.on('disconnect', () => {
        setWallet(prev => ({
          ...prev,
          publicKey: null,
          connected: false,
          connecting: false
        }))
        setBalance(null)
        toast.info('Wallet disconnected')
      })
    }
  }, [])

  const connectWallet = async () => {
    if (!window.solana) {
      toast.error('Phantom wallet not found. Please install Phantom wallet.')
      window.open('https://phantom.app/', '_blank')
      return
    }

    try {
      setWallet(prev => ({ ...prev, connecting: true }))
      const response = await window.solana.connect()
      setWallet(prev => ({
        ...prev,
        publicKey: response.publicKey,
        connected: true,
        connecting: false
      }))
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
      setWallet(prev => ({ ...prev, connecting: false }))
    }
  }

  const disconnectWallet = async () => {
    if (window.solana) {
      try {
        await window.solana.disconnect()
        setWallet({
          publicKey: null,
          connected: false,
          connecting: false,
          connect: connectWallet,
          disconnect: disconnectWallet
        })
        setBalance(null)
      } catch (error) {
        console.error('Failed to disconnect wallet:', error)
        toast.error('Failed to disconnect wallet')
      }
    }
  }

  const fetchBalance = async () => {
    if (!wallet.publicKey) return

    try {
      setLoadingBalance(true)
      const balance = await connection.getBalance(wallet.publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      toast.error('Failed to fetch balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  const copyAddress = () => {
    if (wallet.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toString())
      toast.success('Address copied to clipboard!')
    }
  }

  const openInExplorer = () => {
    if (wallet.publicKey) {
      window.open(`https://explorer.solana.com/address/${wallet.publicKey.toString()}`, '_blank')
    }
  }

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchBalance()
    }
  }, [wallet.connected, wallet.publicKey])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="container mx-auto max-w-2xl pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Solana Wallet Connect</h1>
          <p className="text-gray-400">Connect your Phantom wallet to get started</p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-white">
              {wallet.connected ? 'Wallet Connected' : 'Connect Your Wallet'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {wallet.connected 
                ? 'Your wallet is successfully connected to the Solana network'
                : 'Connect your Phantom wallet to access Solana features'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!wallet.connected ? (
              <Button
                onClick={connectWallet}
                disabled={wallet.connecting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold"
              >
                {wallet.connecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Phantom Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                    <p className="text-white font-mono text-sm">
                      {wallet.publicKey?.toString().slice(0, 8)}...
                      {wallet.publicKey?.toString().slice(-8)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAddress}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openInExplorer}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Balance</p>
                    <p className="text-white font-semibold text-lg">
                      {balance !== null ? `${balance.toFixed(4)} SOL` : '--'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchBalance}
                    disabled={loadingBalance}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {loadingBalance ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                  <Badge variant="secondary" className="bg-green-800 text-green-100">
                    Connected
                  </Badge>
                  <span className="text-green-300 text-sm">Mainnet</span>
                </div>

                <Separator className="bg-gray-700" />

                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by Solana • Secure • Decentralized
          </p>
        </div>
      </div>
    </div>
  )
}
```