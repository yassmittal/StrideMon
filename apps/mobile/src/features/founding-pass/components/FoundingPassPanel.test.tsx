import { render, screen } from '@testing-library/react-native'
import type { HeldFoundingPass } from '../hooks/useFoundingPass'
import { FoundingPassPanel } from './FoundingPassPanel'

const FOUNDING_PASS: HeldFoundingPass = {
  designNumber: 137,
  passTokenId: 137n,
  founderNumber: 42,
  hasGoldFrame: true,
  isLaced: false,
  founderSneakerTokenId: 1n,
}

describe('FoundingPassPanel', () => {
  it('shows the pass, its founder number and its page', async () => {
    await render(<FoundingPassPanel foundingPass={FOUNDING_PASS} imageSvg={undefined} />)

    expect(screen.getByText('Founding Pass  •  #0137  •  Gold frame')).toBeTruthy()
    expect(screen.getByText('Founder 42 of 1,000')).toBeTruthy()
    expect(screen.getByText(/^Not laced yet\./)).toBeTruthy()
    expect(screen.getByText('Free. It can’t be sent or sold.')).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'See Founding Pass #0137 on stridemon.xyz' }),
    ).toBeTruthy()
  })

  it('says when the pass is laced', async () => {
    await render(
      <FoundingPassPanel foundingPass={{ ...FOUNDING_PASS, isLaced: true }} imageSvg={undefined} />,
    )

    expect(screen.getByText(/^Laced\./)).toBeTruthy()
  })
})
