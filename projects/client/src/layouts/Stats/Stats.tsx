import { type FC } from 'react'
import StatsCard from './StatsCard'
import iconWallet from '../../assets/icons/wallet.svg'
import iconBriefcase from '../../assets/icons/briefcase.svg'
import iconUser from '../../assets/icons/user.svg'
import iconClock from '../../assets/icons/clock.svg'
import './Stats.css'
import { Select, SelectItem } from '@heroui/select'

const statsCards = [
  {
    title: 'Баланс',
    amount: 100.0,
    currency: 'р.',
    tip: 'Рекомендуем пополнить кошелек',
    icon: iconWallet,
    iconColor: 'orange-500',
    delta: {
      value: 100,
      isPositive: false,
      showArrow: false
    }
  },
  {
    title: 'Показы',
    amount: 500,
    maxAmount: 500,
    icon: iconBriefcase,
    iconColor: 'purple-500',
    tip: 'Увеличить показы в вашем тарифном плане',
    delta: {
      value: 13,
      isPositive: true,
      showArrow: true
    }
  },
  {
    title: 'Посетители',
    amount: 699,
    icon: iconUser,
    iconColor: 'yellow-500',
    tip: 'Изменить тарифный план чтобы провести А/Б тест',
    delta: {
      value: 9,
      isPositive: true,
      showArrow: true
    }
  },
  {
    title: 'Партнерство',
    amount: 12999.0,
    currency: 'руб.',
    icon: iconClock,
    iconColor: 'blue-500',
    tip: 'Вывести свои доходы можно 28 ноября',
    delta: {
      value: 499,
      isPositive: true,
      showArrow: false
    }
  }
]

const Stats: FC = () => {
  const getPeriodSelector = () => {
    return (
      <Select
        size="sm"
        className="max-w-[200px]"
        placeholder="Выберите период"
        defaultSelectedKeys={['1']}
      >
        <SelectItem key="1">За последние 24 часа</SelectItem>
        <SelectItem key="7">За последние 30 дней</SelectItem>
        <SelectItem key="30">За весь период</SelectItem>
      </Select>
    )
  }

  const getStatsCards = () => {
    return statsCards.map(card => (
      <StatsCard
        key={card.title}
        title={card.title}
        amount={card.amount}
        maxAmount={card.maxAmount}
        currency={card.currency}
        tip={card.tip}
        icon={card.icon}
        isNegative={card.amount == card.maxAmount}
        iconColor={card.iconColor}
        delta={card.delta}
      />
    ))
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="w-full h-full bg-white/85 absolute z-20 flex flex-col items-center justify-center">
        <p className="text-3xl font-light">Скоро будет доступно!</p>
      </div>
      <div className="flex flex-row justify-between items-center w-full">
        <h2 className="text-xl font-display">Статистика</h2>
        {getPeriodSelector()}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-1 md:gap-2 lg:gap-3 h-full mt-2.5">
        {getStatsCards()}
      </div>
    </div>
  )
}

export default Stats
