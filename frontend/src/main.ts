import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { WagmiPlugin } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createAppKit } from '@reown/appkit/vue'

import App from './App.vue'
import router from './router'
import { config, wagmiAdapter, networks } from './config/wagmi'
import { baseSepolia } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'NEEDS_PROJECT_ID'

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: baseSepolia,
  projectId,
  metadata: {
    name: 'Base Clicker',
    description: 'On-chain clicker game on Base',
    url: window.location.origin,
    icons: [`${window.location.origin}/favicon.ico`],
  },
  features: { analytics: false },
})

const app = createApp(App)
const queryClient = new QueryClient()

app.use(createPinia())
app.use(router)
app.use(WagmiPlugin, { config })
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
