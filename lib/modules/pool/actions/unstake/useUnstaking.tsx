/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { isDisabledWithReason } from '@/lib/shared/utils/functions/isDisabledWithReason'
import { useUserAccount } from '@/lib/modules/web3/useUserAccount'
import { LABELS } from '@/lib/shared/labels'
import { useIterateSteps } from '../useIterateSteps'
import { useClaimAndUnstakeStepConfigs } from './useClaimAndUnstakeStepConfigs'

export function useUnstaking() {
  const { isConnected } = useUserAccount()
  const { isDisabled, disabledReason } = isDisabledWithReason([
    !isConnected,
    LABELS.walletNotConnected,
  ])

  const stepConfigs = useClaimAndUnstakeStepConfigs()
  const { currentStep, useOnStepCompleted } = useIterateSteps(stepConfigs)

  return {
    isDisabled,
    disabledReason,
    currentStep,
    useOnStepCompleted,
  }
}