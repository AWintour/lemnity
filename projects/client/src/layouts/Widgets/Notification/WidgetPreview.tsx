import { useShallow } from 'zustand/react/shallow'
import { cn } from '@heroui/theme'

import NotificationEmbedRuntime from './embedded/embedRuntime'
// import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useAppSelector } from '@/stores/redux/hooks'
import { selectTriggerPosition } from './notificationSlice'

// import type {
//   NotificationWidgetType,
// } from '@lemnity/widget-config/widgets/notification'
// import { notificationWidgetDefaults as defaults } from './defaults'

const WidgetPreview = () => {
  const triggerPosition = useAppSelector(selectTriggerPosition)

  return (
    <div className='w-full h-full flex'>
      <div
        className={cn(
          'mt-auto mb-3',
          triggerPosition === 'bottom-right'
            ? 'ml-auto mr-0'
            : 'ml-0 mr-auto',
        )}
      >
        <NotificationEmbedRuntime preview />
      </div>
    </div>
  )
}

export default WidgetPreview
