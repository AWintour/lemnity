import type { FontWeight } from '@lemnity/widget-config/widgets/announcement'

export const getFontWeightClass = (variant: FontWeight) => {
  switch (variant) {
    case 'medium':
      return 'font-medium'
    case 'regular':
      return 'font-normal'
    case 'bold':
      return 'font-bold' 
  }
}
