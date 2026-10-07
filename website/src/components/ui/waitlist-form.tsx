'use client'

import { useEffect, useRef, useState } from 'react'
import { waitlistApiUrl } from '@/content/site'
import {
  forgetReferralCode,
  readRememberedReferralCode,
  rememberReferralCode,
} from '@/lib/remembered-referral-code'
import { fetchWaitlistPlace, type WaitlistPlace } from '@/lib/waitlist-request'
import { WaitlistCodeStep } from './waitlist-code-step'
import { WaitlistEmailStep } from './waitlist-email-step'
import { WaitlistPlaceCard } from './waitlist-place-card'

type WaitlistStep =
  | { kind: 'email' }
  | { kind: 'code'; email: string }
  | { kind: 'place'; place: WaitlistPlace }

// The Founding Pass line (D-037, D-041): email, then the 6-digit code from the email, then the
// place in line with a share link. A browser that verified before opens on its place.
export function WaitlistForm() {
  const [step, setStep] = useState<WaitlistStep>({ kind: 'email' })
  const stepContainerRef = useRef<HTMLDivElement>(null)
  const hasChangedStep = useRef(false)
  const stepKind = step.kind

  useEffect(() => {
    const rememberedReferralCode = readRememberedReferralCode()
    if (rememberedReferralCode === null) return
    let isCancelled = false
    fetchWaitlistPlace(waitlistApiUrl, rememberedReferralCode).then((place) => {
      if (isCancelled || place === null) return
      setStep((currentStep) =>
        currentStep.kind === 'email' ? { kind: 'place', place } : currentStep,
      )
    })
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    // The step that was there is gone, so keep keyboard focus inside the new one: its first field,
    // or the place itself. Not on the first render, or the page would scroll to the form on load.
    if (!hasChangedStep.current) return
    const focusTargetSelector = stepKind === 'place' ? '[tabindex="-1"]' : 'input'
    stepContainerRef.current?.querySelector<HTMLElement>(focusTargetSelector)?.focus()
  }, [stepKind])

  function goToStep(nextStep: WaitlistStep) {
    hasChangedStep.current = true
    setStep(nextStep)
  }

  function showPlace(place: WaitlistPlace) {
    rememberReferralCode(place.referralCode)
    goToStep({ kind: 'place', place })
  }

  function startOver() {
    forgetReferralCode()
    goToStep({ kind: 'email' })
  }

  return (
    <div ref={stepContainerRef} aria-live="polite">
      {step.kind === 'email' && (
        <WaitlistEmailStep onCodeSent={(email) => goToStep({ kind: 'code', email })} />
      )}
      {step.kind === 'code' && (
        <WaitlistCodeStep email={step.email} onVerified={showPlace} onChangeEmail={startOver} />
      )}
      {step.kind === 'place' && <WaitlistPlaceCard place={step.place} onNotYou={startOver} />}
    </div>
  )
}
