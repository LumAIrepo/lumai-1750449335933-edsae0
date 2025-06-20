```typescript
'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
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
  TrustWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  ExodusWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
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
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  WalletConnectWalletAdapter,
  XDEFIWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo, ReactNode } from 'react'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

interface WalletContextProviderProps {
  children: ReactNode
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
      new ExodusWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new MathWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new SlopeWalletAdapter(),
      new SafePalWalletAdapter(),
      new TrustWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new BitKeepWalletAdapter(),
      new BitpieWalletAdapter(),
      new CoinhubWalletAdapter(),
      new HuobiWalletAdapter(),
      new HyperPayWalletAdapter(),
      new KeystoneWalletAdapter(),
      new KrystalWalletAdapter(),
      new NightlyWalletAdapter(),
      new NufiWalletAdapter(),
      new OntoWalletAdapter(),
      new ParticleAdapter({
        projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || '',
        clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || '',
        appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID || '',
      }),
      new SalmonWalletAdapter(),
      new SkyWalletAdapter(),
      new SpotWalletAdapter(),
      new TokenaryWalletAdapter(),
      new WalletConnectWalletAdapter({
        network,
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        },
      }),
      new XDEFIWalletAdapter(),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export { WalletAdapterNetwork }
```