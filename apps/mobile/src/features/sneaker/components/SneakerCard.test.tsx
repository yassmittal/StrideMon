import { render, screen } from '@testing-library/react-native'
import { SneakerCard } from './SneakerCard'

type SneakerCardProps = Parameters<typeof SneakerCard>[0]

const STARTER_SNEAKER: SneakerCardProps = {
  sneakerTokenId: 7n,
  level: 1,
  efficiency: 10,
  durability: 100,
  maxDurability: 100,
  energy: { currentEnergy: 10, maxEnergy: 10, secondsUntilNextEnergyPoint: null },
  explorerUrl: 'https://testnet.monadvision.com/nft/0xabc/7',
}

describe('SneakerCard', () => {
  it('shows a starter Sneaker: id, level 1, efficiency 10, durability 100/100, energy 10/10', async () => {
    await render(<SneakerCard {...STARTER_SNEAKER} />)

    expect(screen.getByText('Sneaker #7')).toBeTruthy()
    expect(screen.getByLabelText('Level: 1')).toBeTruthy()
    expect(screen.getByLabelText('Efficiency: 10')).toBeTruthy()
    expect(
      screen.getByRole('progressbar', { name: 'Durability' }).props.accessibilityValue,
    ).toMatchObject({
      now: 100,
      max: 100,
    })
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

  it('links to the Sneaker on the explorer', async () => {
    await render(<SneakerCard {...STARTER_SNEAKER} />)

    expect(screen.getByRole('link', { name: 'View Sneaker 7 on the explorer' })).toBeTruthy()
  })
})
