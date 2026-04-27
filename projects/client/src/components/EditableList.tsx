import { Button } from '@heroui/button'
import { type ReactNode } from 'react'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import SvgIcon from './SvgIcon'
import iconBin from '@/assets/icons/bin.svg'
import iconAdd from '@/assets/icons/add.svg'
import iconArrowDown from '@/assets/icons/arrow-down.svg'
import iconArrowUp from '@/assets/icons/arrow-up.svg'
import type { RootState } from '@/stores/redux/store'
import type { EntitySelectors } from '@reduxjs/toolkit'

import { useAppSelector } from '@/stores/redux/hooks'

type MoveUpButtonProps = {
  index: number
  disabled?: boolean
  handleMove: (index: number) => void
  ariaLabel: string
  iconSrc: string
}

const ItemMoveButton = (props: MoveUpButtonProps) => {
  const handleClick = () => {
    props.handleMove(props.index)
  }

  const whileHover = { scale: 1.15 }
  const whileTap = { scale: 0.95 }
  const transition: Transition = { type: 'spring', stiffness: 400, damping: 30 }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={props.disabled}
      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
      aria-label={props.ariaLabel}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={transition}
    >
      {/* <div className='w-2 h-1.5'> */}
      <SvgIcon src={props.iconSrc} size={9} className="text-current" />
      {/* </div> */}
    </motion.button>
  )
}

export type EditableListItem<T> = T & {
  id: string
}

type TypedEntitySelectors<T> =
  EntitySelectors<EditableListItem<T>, RootState, string>

export type EditableListProps<T> = {
  idsSelector: TypedEntitySelectors<T>['selectIds']
  onItemsReorder: (ids: string[]) => void
  renderItem: (id: string) => ReactNode
  renderBelow?: (id: string) => ReactNode
  onAdd?: () => void
  onDelete?: (id: string) => void
  addButtonLabel?: string
  maxItems?: number
  minItems?: number
  showIndex?: boolean
  canDelete?: boolean
  canReorder?: boolean
  classNames?: {
    item?: string
    index?: string
    delete?: string
    reorder?: string
    add?: string
  }
  disabledReorderIds?: string[]
}

const EditableList = <T,>({
  idsSelector,
  onItemsReorder,
  renderItem,
  renderBelow,
  onDelete,
  onAdd,
  addButtonLabel = 'Добавить',
  maxItems,
  minItems,
  showIndex = true,
  canDelete = true,
  canReorder = false,
  classNames = {
    item: '',
    index: '',
    delete: '',
    reorder: '',
    add: ''
  },
  disabledReorderIds = []
}: EditableListProps<T>) => {
  const itemIds = useAppSelector(idsSelector)

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    if (disabledReorderIds?.includes(itemIds[index])) return
    const newItems = [...itemIds]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    onItemsReorder(newItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === itemIds.length - 1) return
    if (disabledReorderIds?.includes(itemIds[index])) return
    const newItems = [...itemIds]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    onItemsReorder(newItems)
  }

  const canAddMore = !maxItems || itemIds.length < maxItems

  return (
    <div className="flex flex-col gap-2.5 h-full w-full">
      {itemIds.map((itemId, index) => {
        const below = renderBelow?.(itemId)
        return (
          <motion.div
            key={itemId}
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col gap-2"
          >
            <div className={`flex items-center gap-2`}>
              {showIndex && (
                <div className={`min-w-10 ${classNames?.index}`}>
                  <span className={'text-sm font-normal text-gray-900'}>
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              )}
              {canReorder && (
                <div className={`flex flex-col ${classNames?.reorder || ''}`}>
                  <ItemMoveButton
                    ariaLabel='Переместить вверх'
                    handleMove={handleMoveUp}
                    iconSrc={iconArrowUp}
                    disabled={index === 0 || disabledReorderIds?.includes(itemId)}
                    index={index}
                  />
                  <ItemMoveButton
                    ariaLabel='Переместить вниз'
                    handleMove={handleMoveDown}
                    iconSrc={iconArrowDown}
                    disabled={index === itemIds.length - 1 || disabledReorderIds?.includes(itemId)}
                    index={index}
                  />
                </div>
              )}
              <div className="flex-1 h-full">{renderItem(itemId)}</div>
              {canDelete && onDelete && (
                <Button
                  type="button"
                  onPress={() => onDelete(itemId)}
                  isIconOnly
                  isDisabled={itemIds.length <= (minItems ?? 0)}
                  variant="ghost"
                  // Необходимо переопределить дефолтное значение
                  // min-w-10
                  className={`min-w-7.75 w-7.75 border border-[#E8E8E8] h-10 rounded-[5px] text-red-500 hover:text-red-700 p-1 ${classNames?.delete}`}
                  aria-label="Удалить"
                >
                  <div className="w-3.25 h-4">
                    <SvgIcon src={iconBin} className="text-[#B7081B]" />
                  </div>
                </Button>
              )}
            </div>
            <AnimatePresence initial={false}>
              {below ? (
                <motion.div
                  key={`${itemId}-below`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {below}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )
      })}
      {onAdd && canAddMore && (
        <Button
          variant="flat"
          onPress={onAdd}
          // radius="sm"
          className={`text-md w-fit rounded-[5px] ${classNames?.add}`}
          startContent={<SvgIcon src={iconAdd} size={'20px'} className="text-[#797979]" />}
        >
          {addButtonLabel}
        </Button>
      )}
    </div>
  )
}

export default EditableList
