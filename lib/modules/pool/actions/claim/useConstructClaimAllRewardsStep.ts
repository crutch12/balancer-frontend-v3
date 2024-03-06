import { FlowStep, TransactionLabels } from '@/lib/shared/components/btns/transaction-steps/lib'
import { useUserAccount } from '../../../web3/useUserAccount'
import { useManagedTransaction } from '../../../web3/contracts/useManagedTransaction'
import { useClaimCallDataQuery } from './useClaimCallDataQuery'
import { selectStakingService } from '@/lib/modules/staking/selectStakingService'
import { GqlChain, GqlPoolStakingType } from '@/lib/shared/services/api/generated/graphql'
import networkConfigs from '@/lib/config/networks'
import { useClaiming } from './useClaiming'
import { useEffect } from 'react'
import { getChainId } from '@/lib/config/app.config'
import { PoolListItem } from '../../pool.types'
import { getAllGaugesAddressesFromPool } from '@/lib/modules/portfolio/usePortfolio'

export function useConstructClaimAllRewardsStep(pools: PoolListItem[]) {
  const { isConnected } = useUserAccount()
  const { nonBalRewards, balRewards, refetchClaimableRewards, refetchBalRewards } =
    useClaiming(pools)

  const pool = pools[0]
  const chain = pool.chain as GqlChain
  const stakingType = pool.staking?.type || GqlPoolStakingType.Gauge
  const gaugeAddresses = pools.flatMap(pool => getAllGaugesAddressesFromPool(pool))
  const shouldClaimMany = gaugeAddresses.length > 1
  const stakingService = selectStakingService(chain, stakingType)
  const { data: claimData } = useClaimCallDataQuery(
    gaugeAddresses,
    stakingService,
    nonBalRewards.length > 0,
    balRewards.length > 0
  )

  const transactionLabels: TransactionLabels = {
    init: `Claim${shouldClaimMany ? ' all' : ''}`,
    confirming: 'Confirming...',
    confirmed: 'Claimed',
    tooltip: shouldClaimMany
      ? 'Claim all rewards from your gauges'
      : 'Claim all rewards from your gauge',
  }

  const claimAllRewardsTransaction = useManagedTransaction(
    networkConfigs[chain].contracts.balancer.relayerV6,
    'balancer.relayerV6',
    'multicall',
    transactionLabels,
    getChainId(chain),
    { args: [claimData] },
    {
      enabled: gaugeAddresses.length > 0 && claimData && claimData.length > 0,
    }
  )

  const claimAllRewardsStep: FlowStep = {
    ...claimAllRewardsTransaction,
    transactionLabels,
    id: 'claimAllRewards',
    stepType: 'claim',
    isComplete: () => isConnected && claimAllRewardsStep.result.isSuccess,
  }

  useEffect(() => {
    if (claimAllRewardsTransaction.result.isSuccess) {
      refetchClaimableRewards()
      refetchBalRewards()
    }
  }, [claimAllRewardsTransaction.result.isSuccess, refetchClaimableRewards, refetchBalRewards])

  return {
    claimAllRewardsStep,
  }
}