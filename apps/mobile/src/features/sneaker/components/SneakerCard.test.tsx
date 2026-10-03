import { render, screen } from '@testing-library/react-native'
import { SneakerCard } from './SneakerCard'

type SneakerCardProps = Parameters<typeof SneakerCard>[0]

const STARTER_SNEAKER: SneakerCardProps = {
  sneakerTokenId: 7n,
  imageSvg:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#141515"/></svg>',
  level: 1,
  efficiency: 10,
  durability: 100,
  maxDurability: 100,
  energy: { currentEnergy: 10, maxEnergy: 10, secondsUntilNextEnergyPoint: null },
  explorerUrl: 'https://testnet.monadvision.com/nft/0xabc/7',
}

describe('SneakerCard', () => {
  it('shows a starter Sneaker: its picture (id, level, durability), efficiency 10, energy 10/10', async () => {
    await render(<SneakerCard {...STARTER_SNEAKER} />)

    expect(
      screen.getByRole('image', { name: 'Sneaker #7: level 1, durability 100 of 100' }),
    ).toBeTruthy()
    expect(screen.getByLabelText('Efficiency: 10')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Energy' }).props.accessibilityValue,
    ).toMatchObject({
      now: 10,
      max: 10,
    })
    expect(screen.getByText(/Full energy/)).toBeTruthy()
  })

  it('counts down to the next energy point when energy isn’t full', async () => {
    await render(
      <SneakerCard
        {...STARTER_SNEAKER}
        energy={{ currentEnergy: 4, maxEnergy: 10, secondsUntilNextEnergyPoint: 754 }}
      />,
    )

    expect(screen.getByText('Next energy point in 12:34')).toBeTruthy()
  })

  it('holds the picture’s place while the on-chain SVG loads', async () => {
    await render(<SneakerCard {...STARTER_SNEAKER} imageSvg={undefined} />)

    expect(
      screen.getByRole('image', { name: 'Sneaker #7: level 1, durability 100 of 100' }),
    ).toBeTruthy()
  })

  it('links to the Sneaker on the explorer', async () => {
    await render(<SneakerCard {...STARTER_SNEAKER} />)

    expect(screen.getByRole('link', { name: 'View Sneaker 7 on the explorer' })).toBeTruthy()
  })
})
