import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import CustomSwitch from '@/components/CustomSwitch'
import Modal from '@/components/Modal/Modal'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProject: (projectName: string, websiteUrl: string, enabled?: boolean) => void | Promise<void>
  // 'edit' переиспользует ту же форму для редактирования проекта (префилл + другие тексты).
  mode?: 'create' | 'edit'
  initialName?: string
  initialUrl?: string
  initialEnabled?: boolean
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  mode = 'create',
  initialName,
  initialUrl,
  initialEnabled
}) => {
  const isEdit = mode === 'edit'

  const [isEnabled, setIsEnabled] = useState(initialEnabled ?? true)

  const [projectName, setProjectName] = useState(initialName ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(initialUrl ?? '')

  const [submitting, setSubmitting] = useState(false)

  // Синхронизируем поля при каждом открытии: create → пустые, edit → текущие данные проекта.
  useEffect(() => {
    if (isOpen) {
      setProjectName(initialName ?? '')
      setWebsiteUrl(initialUrl ?? '')
      setIsEnabled(initialEnabled ?? true)
    }
  }, [isOpen, initialName, initialUrl, initialEnabled])

  // No need for local backdrop handler; handled centrally in Modal

  const getContent = () => {
    return (
      <div className="flex flex-col p-4.5 gap-2.5 border border-gray-200 rounded-[14px]">
        <div className="flex flex-col gap-2.5">
          <label className="block text-sm font-medium text-gray-700">
            Укажите название проекта
          </label>
          <Input
            placeholder="Укажите заголовок"
            variant="bordered"
            className="w-full"
            radius="sm"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label className="block text-sm font-medium text-gray-700">Добавить домен</label>
          <Input
            placeholder="Укажите ссылку на сайт"
            variant="bordered"
            className="w-full"
            radius="sm"
            endContent={
              <CustomSwitch isSelected={isEnabled} onValueChange={setIsEnabled} size="sm" />
            }
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
          />
          <span className="text-gray-400 text-xs">
            Если сайт проекта выключен, то вы не сможете увидеть аналитику
          </span>
        </div>
      </div>
    )
  }

  const handleCreate = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onAddProject(projectName, websiteUrl, isEnabled)
    } finally {
      setSubmitting(false)
    }
  }, [onAddProject, projectName, websiteUrl, isEnabled, submitting])

  const getFooter = () => {
    return (
      <div className="flex items-center justify-start gap-3">
        <Button
          variant="solid"
          isDisabled={submitting || !projectName}
          onPress={handleCreate}
          className="px-6 bg-[#e7f3e5] text-[#3BB240]"
        >
          {submitting ? (isEdit ? 'Сохранение…' : 'Создание…') : isEdit ? 'Сохранить' : 'Создать'}
        </Button>
        <Button
          color="danger"
          variant="solid"
          onPress={onClose}
          className="px-6 bg-[#FFD4C4] text-[#FF001C]"
        >
          Отменить
        </Button>
      </div>
    )
  }

  const getHeader = () => {
    return (
      <div className="flex items-center justify-between ">
        <div className="flex flex-col gap-2 ">
          <h2 className="font-display font-semibold text-4xl tracking-[0.01em]">
            {isEdit ? 'Изменение проекта' : 'Добавление проекта'}
          </h2>
          <span className="text-base text-gray-600">
            {isEdit ? (
              'Измените название проекта и домен сайта.'
            ) : (
              <>
                Создайте всплывающее окно в стиле вашего бренда.
                <br />
                Показывайте его нужной аудитории в подходящий момент, используя триггеры и правила
                таргетинга
              </>
            )}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors -mr-2 -mt-2 self-start"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      role="dialog"
      closeOnBackdrop={!submitting}
      closeOnEsc={!submitting}
      containerClassName="w-full max-w-[590px]"
    >
      <div className="flex h-full">
        <div className="flex-1 flex flex-col p-5 gap-4.5">
          {getHeader()}
          {getContent()}
          {getFooter()}
        </div>
      </div>
    </Modal>
  )
}

export default AddProjectModal
