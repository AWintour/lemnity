import { nanoid, type EntitySelectors } from '@reduxjs/toolkit'
import { useState } from 'react'
import { cn } from '@heroui/theme'
import { PopoverContent, PopoverTrigger } from '@heroui/popover'

import EditableList, { type EditableListItem } from '@/components/EditableList'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import SvgIcon from '@/components/SvgIcon'
import {
  Input,
  Button,
  ButtonChevron,
  Popover,
  FontSizeSettings,
} from '@/components'

import { useAppSelector, useAppDispatch } from '@/stores/redux/hooks'
import {
  selectDelay,
  selectNotificationIds,
  delayChanged,
  notificationAdded,
  notificationDeleted,
  notificationUpdated,
  notificationsReordered,
  defaultNotifications,
  selectNotificationById,
} from './notificationSlice'

import type {
  Notification,
  Expiration,
} from '@lemnity/widget-config/widgets/notification'
import gearIcon from '@/assets/icons/gear.svg'
import type { RootState } from '@/stores/redux/store'

type NotificationItemProps = {
  id: string
  pendingItemId: string | null
  setPendingItemId: (id: string | null) => void
  onTextChange: (text: string) => void
}

const NotificationItem = (props: NotificationItemProps) => {
  const isActive = props.id === props.pendingItemId
  const notification = useAppSelector(
    (state: RootState) => selectNotificationById(state, props.id)
  )

  const handleButtonPress = () => {
    if (
      typeof props.pendingItemId === 'string'
      && props.pendingItemId !== props.id
    ) {
      props.setPendingItemId(null)
      // костыль. я пока не знаю, как сделать правильно
      // https://stackoverflow.com/a/75403839/21210000
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#late_timeouts
      setTimeout(() => {
        props.setPendingItemId(props.id)
      })
      return
    }

    props.setPendingItemId(
      isActive
        ? null
        : props.id
      )
  }

  const inputClassNames = {
    inputWrapper: 'min-h-10',
  }

  return (
    <div className='flex flex-row gap-2.5'>
      <Input
        classNames={inputClassNames}
        value={notification.text}
        onValueChange={props.onTextChange}
      />
      <Button
        className={cn(
          'min-w-14.25 h-10 px-0',
          isActive ? 'bg-[#E8E8E8]' : 'bg-white',
        )}
        onPress={handleButtonPress}
      >
        <div className='flex flex-row w-fit gap-1'>
          <div className='w-4 h-4'>
            <SvgIcon src={gearIcon} preserveOriginalColors />
          </div>
          <ButtonChevron open={isActive} />
        </div>
      </Button>
    </div>
  )
}

type ExpirationPopoverProps = {
  expiration: Expiration
  pendingItemId: string | null
  onExpirationChange: (expiration: Expiration) => void
}

const ExpirationPopover = (props: ExpirationPopoverProps) => {
  const [open, setOpen] = useState(false)

  const expirationVariants: Expiration[] = ['6', '12', '24', '48', 'indefinite']
  const popoverClassNames = {
    base: 'rounded-[5px]',
    content: 'w-32.5 p-2.5 flex-col rounded-[5px]',
  }

  const handleTriggerPress = () => {
    setOpen(!open)
  }

  return (
    <Popover placement='right-end' classNames={popoverClassNames}>
      <PopoverTrigger>
        <Button
          className='min-w-16.75 h-10 px-0'
          onPress={handleTriggerPress}
        >
          <div className='flex flex-row gap-1.25'>
            <span className='text-base leading-3.75'>
              {props.expiration === 'indefinite'
                ? '∞'
                : props.expiration
              }
            </span>
            <ButtonChevron open={open} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <span className='text-[11px] leading-3.25'>
          Выберите, как долго уведомление будет видно
        </span>

        {expirationVariants.map(variant => (
          <Button
            key={nanoid()}
            className={cn(
              'w-full h-[unset] px-4 py-2.5',
              props.expiration === variant
                ? 'border-[#915DC0]'
                : 'border-[#E8E8E8]',
            )}
            onPress={() => props.onExpirationChange(variant)}
          >
            <span className='text-base leading-3.75'>
              {variant === 'indefinite'
                ? 'Постоянно'
                : `${variant} ${variant === '24' ? 'часа' : 'часов'}`
              }
            </span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

type NotificationItemSettingsProps = {
  id: string
  pendingItemId: string | null
  onUrlTextChange: (urlText: string) => void
  onUrlChange: (urlText: string) => void
  onExpirationChange: (expiration: Expiration) => void
  onUrlFontSizeChange: (size: number) => void
}

const NotificationItemSettings = (props: NotificationItemSettingsProps) => {
  const notification = useAppSelector(
    (state: RootState) => selectNotificationById(state, props.id)
  )

  const inputClassNames = {
    inputWrapper: 'min-h-10',
    base: 'min-w-60',
  }

  return (
    <div
      className='w-full p-3 flex flex-col gap-2.5 bg-[#E8E8E8] rounded-[5px]'
    >
      <span className='text-[16px] leading-3.75 text-[#3D3D3B]'>
        Настройка кнопки
      </span>      

      <div className='w-full flex flex-row flex-wrap gap-2.5 @container'>
        <Input
          classNames={inputClassNames}
          value={notification.urlText}
          onValueChange={props.onUrlTextChange}
        />
        <Input
          classNames={inputClassNames}
          value={notification.url}
          onValueChange={props.onUrlChange}
        />
        <div
          className={cn(
            'w-full flex flex-row justify-between gap-2.5',
            '@min-[700px]:justify-start @min-[700px]:max-w-fit',
          )}
        >
          <FontSizeSettings
            xs
            value={notification.urlFontSize}
            onChange={props.onUrlFontSizeChange}
          />
          <ExpirationPopover
            expiration={notification.expiration}
            pendingItemId={props.pendingItemId}
            onExpirationChange={props.onExpirationChange}
          />
        </div>
      </div>
    </div>
  )
}

const NotificationSettings = () => {
  const dispatch = useAppDispatch()
  const delay = useAppSelector(selectDelay)
  const notificationsExist = !!useAppSelector(selectNotificationIds)

  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  const listClassNames = {
    index: 'min-w-[40px]',
    // delete: 'h-12.75',
  }
  const inputClassNames = {
    base: 'min-w-[unset] max-w-19',
    inputWrapper: 'min-h-10',
    input: cn(
      '[&::-webkit-outer-spin-button]:appearance-none',
      '[&::-webkit-inner-spin-button]:appearance-none',
      '[&]:remove-spin-buttons',
    )
  }

  const handleDelayChange = (value: string) => {
    dispatch(delayChanged(+value))
  }
  const handleItemsReorder = (ids: string[]) => {
    dispatch(notificationsReordered(ids))
  }
  const handleAdd = () => {
    dispatch(notificationAdded({ ...defaultNotifications[0], id: nanoid() }))
  }
  const handleDelete = (id: string) => {
    dispatch(notificationDeleted(id))
  }
  const handleTextChange = (id: string, text: string) => {
    dispatch(notificationUpdated({ id, text }))
  }
  const handleUrlTextChange = (id: string, urlText: string) => {
    dispatch(notificationUpdated({ id, urlText }))
  }
  const handleUrlChange = (id: string, url: string) => {
    dispatch(notificationUpdated({ id, url }))
  }
  const handleExpirationChange = (id: string, expiration: Expiration) => {
    dispatch(notificationUpdated({ id, expiration }))
  }
  const handleUrlFontSizeChange = (id: string, urlFontSize: number) => {
    dispatch(notificationUpdated({ id, urlFontSize }))
  }

  const renderItem = (id: string) => (
    <NotificationItem
      id={id}
      pendingItemId={pendingItemId}
      setPendingItemId={setPendingItemId}
      onTextChange={value => handleTextChange(id, value)}
    />
  )
  const renderBelow = (id: string) => (
    id === pendingItemId && (
      <NotificationItemSettings
        id={id}
        pendingItemId={pendingItemId}
        onUrlTextChange={value => handleUrlTextChange(id, value)}
        onUrlChange={value => handleUrlChange(id, value)}
        onExpirationChange={value => handleExpirationChange(id, value)}
        onUrlFontSizeChange={value => handleUrlFontSizeChange(id, value)}
      />
    )
  )

  return (
    <BorderedContainer>
      <div className='w-full flex flex-col'>
        <div className='h-9.25 shrink-0 flex justify-between'>
          <span className='text-lg leading-5.25 font-medium'>
            Секторы
          </span>
          <span className='text-lg text-[#C0C0C0] leading-5.25'>
            Максимум 5
          </span>
        </div>

        <div className='flex flex-row gap-2.5 items-center'>
          <Input
            type='number'
            value={delay.toString()}
            min={0}
            classNames={inputClassNames}
            onValueChange={handleDelayChange}
            endContent='сек'
          />
          <span className='text-base leading-3.75'>
            Укажите задержку перед показом уведомлений
          </span>
        </div>

        <hr className='border-[#E1E1E1] my-2.5' />

        <div className='w-full flex flex-col gap-2.5'>
          {notificationsExist && (
            <EditableList
              showIndex={false}
              idsSelector={selectNotificationIds}
              maxItems={5}
              onItemsReorder={handleItemsReorder}
              canReorder
              classNames={listClassNames}
              renderItem={renderItem}
              renderBelow={renderBelow}
              onDelete={handleDelete}
              onAdd={handleAdd}
              addButtonLabel='Добавить сектор'
            />
          )}
        </div>
      </div>
    </BorderedContainer>
  )
}

export default NotificationSettings
