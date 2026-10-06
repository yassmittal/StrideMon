import { AbsoluteFill } from 'remotion'
import { RunScreen } from '../components/RunScreen'
import { coldOpenRunScreen, ENERGY_AT_START, screenshotRunScreen } from '../content'

/** The rebuild in screenshot 03's state, for the 50/50 overlay check against the PNG. */
export function RunScreenCheck() {
  return (
    <AbsoluteFill>
      <RunScreen
        state={{
          timerSteps: [{ startFrame: 0, text: screenshotRunScreen.timerText }],
          distanceSteps: [{ startFrame: 0, text: screenshotRunScreen.distanceText }],
          speedText: screenshotRunScreen.speedText,
          energyLeft: screenshotRunScreen.energyLeft,
          energyAtStart: ENERGY_AT_START,
          estimatedRewardText: screenshotRunScreen.estimatedRewardText,
          estimateNoteLines: coldOpenRunScreen.estimateNoteLines,
          gpsStatus: screenshotRunScreen.gpsStatus,
          metaItems: coldOpenRunScreen.metaItems,
          stopLabel: coldOpenRunScreen.stopLabel,
        }}
      />
    </AbsoluteFill>
  )
}
