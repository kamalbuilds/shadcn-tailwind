import { useEffect, useState } from 'react'
import { sbtcService } from '@/lib/services/sbtc'
import type { EmilyLimits, SBTCSupply } from '@/lib/services/sbtc'

interface SBTCState {
  supply: SBTCSupply | null
  limits: EmilyLimits | null
  isLoading: boolean
  error: string | null
}

export function useSBTC() {
  const [state, setState] = useState<SBTCState>({
    supply: null,
    limits: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const [supply, limits] = await Promise.all([
          sbtcService.getCurrentSupply(),
          sbtcService.getEmilyLimits(),
        ])

        setState({
          supply,
          limits,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Failed to fetch sBTC data:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch sBTC data',
        }))
      }
    }

    fetchData()
  }, [])

  const getBTCBalance = async (address: string) => {
    try {
      return await sbtcService.getBTCBalance(address)
    } catch (error) {
      console.error('Failed to get BTC balance:', error)
      throw error
    }
  }

  const getTestnetBTC = async (address: string) => {
    try {
      return await sbtcService.getTestnetBTC(address)
    } catch (error) {
      console.error('Failed to get testnet BTC:', error)
      throw error
    }
  }

  return {
    ...state,
    getBTCBalance,
    getTestnetBTC,
  }
} 