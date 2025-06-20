```tsx
'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface WalletInfoProps {
  className?: string
}

export default function WalletInfo({ className }: WalletInfoProps) {
  const { connection } = useConnection()
  const { publicKey, disconnect, connected } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      try {
        setLoading(true)
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Error fetching balance:', error)
        setBalance(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()

    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [publicKey, connection, connected])

  const copyAddress = async () => {
    if (!publicKey) return
    
    try {
      await navigator.clipboard.writeText(publicKey.toString())
      toast.success('Address copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const openExplorer = () => {
    if (!publicKey) return
    window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connected || !publicKey) {
    return (
      <Card className={`bg-gray-900 border-gray-800 ${className}`}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="h-5 w-5" />
          Wallet Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-800 rounded-md text-sm text-gray-300 font-mono">
              {formatAddress(publicKey.toString())}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="border-gray-700 hover:bg-gray-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openExplorer}
              className="border-gray-700 hover:bg-gray-800"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Balance</label>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-gray-800 animate-pulse rounded-md" />
            ) : (
              <Badge variant="secondary" className="bg-gray-800 text-white text-lg px-3 py-1">
                {balance !== null ? `${balance.toFixed(4)} SOL` : 'Error loading'}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Status</label>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Connected
          </Badge>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <Button
            variant="destructive"
            onClick={disconnect}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```