```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface WalletConnectButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

interface WalletAdapter {
  name: string
  icon: string
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  publicKey: string | null
  connected: boolean
}

export default function WalletConnectButton({ 
  className = '',
  variant = 'default',
  size = 'default'
}: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [wallet, setWallet] = useState<WalletAdapter | null>(null)
  const [availableWallets, setAvailableWallets] = useState<WalletAdapter[]>([])

  useEffect(() => {
    // Simulate wallet detection
    const mockWallets: WalletAdapter[] = [
      {
        name: 'Phantom',
        icon: '👻',
        connect: async () => {
          setIsConnecting(true)
          await new Promise(resolve => setTimeout(resolve, 1000))
          setWallet({
            name: 'Phantom',
            icon: '👻',
            connect: async () => {},
            disconnect: async () => {
              setWallet(null)
              toast.success('Wallet disconnected')
            },
            publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            connected: true
          })
          setIsConnecting(false)
          toast.success('Phantom wallet connected')
        },
        disconnect: async () => {},
        publicKey: null,
        connected: false
      },
      {
        name: 'Solflare',
        icon: '🔥',
        connect: async () => {
          setIsConnecting(true)
          await new Promise(resolve => setTimeout(resolve, 1000))
          setWallet({
            name: 'Solflare',
            icon: '🔥',
            connect: async () => {},
            disconnect: async () => {
              setWallet(null)
              toast.success('Wallet disconnected')
            },
            publicKey: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            connected: true
          })
          setIsConnecting(false)
          toast.success('Solflare wallet connected')
        },
        disconnect: async () => {},
        publicKey: null,
        connected: false
      },
      {
        name: 'Backpack',
        icon: '🎒',
        connect: async () => {
          setIsConnecting(true)
          await new Promise(resolve => setTimeout(resolve, 1000))
          setWallet({
            name: 'Backpack',
            icon: '🎒',
            connect: async () => {},
            disconnect: async () => {
              setWallet(null)
              toast.success('Wallet disconnected')
            },
            publicKey: '5fNfvyp5czQVX77yoACa3JJVEhdRaWjPuazuWgjhTqEH',
            connected: true
          })
          setIsConnecting(false)
          toast.success('Backpack wallet connected')
        },
        disconnect: async () => {},
        publicKey: null,
        connected: false
      }
    ]
    setAvailableWallets(mockWallets)
  }, [])

  const handleWalletConnect = async (walletAdapter: WalletAdapter) => {
    try {
      await walletAdapter.connect()
    } catch (error) {
      toast.error('Failed to connect wallet')
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (wallet) {
      try {
        await wallet.disconnect()
      } catch (error) {
        toast.error('Failed to disconnect wallet')
      }
    }
  }

  const copyAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey)
      toast.success('Address copied to clipboard')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (wallet?.connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            className={`gap-2 ${className}`}
          >
            <span className="text-lg">{wallet.icon}</span>
            <span className="font-mono text-sm">
              {formatAddress(wallet.publicKey!)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyAddress} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.open(`https://solscan.io/account/${wallet.publicKey}`, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on Solscan
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className}`}
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableWallets.map((walletAdapter) => (
          <DropdownMenuItem
            key={walletAdapter.name}
            onClick={() => handleWalletConnect(walletAdapter)}
            className="gap-3 cursor-pointer"
            disabled={isConnecting}
          >
            <span className="text-lg">{walletAdapter.icon}</span>
            <span>{walletAdapter.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```