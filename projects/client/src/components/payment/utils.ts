export const getDaysWord = (days: number) => {
  const absDays = Math.abs(days)
  const lastTwoDigits = absDays % 100
  const lastDigit = absDays % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'дней'
  }

  if (lastDigit === 1) {
    return 'день'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня'
  }

  return 'дней'
}

