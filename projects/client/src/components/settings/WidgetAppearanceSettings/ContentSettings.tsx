import { uploadImage } from '@/api/upload'
import CustomRadioGroup, {
  type CustomRadioGroupOption,
} from '@/components/CustomRadioGroup'
import ImageUploader from '@/components/ImageUploader'
import SwitchableField from '@/components/SwitchableField'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import type {
  Content,
  ContentAlignment,
  Format,
} from '@lemnity/widget-config/widgets/announcement'
import { useEffect, useState } from 'react'

type ContentSettingsProps = {
  contentType: Content
  contentAlignment?: ContentAlignment
  contentUrl?: string
  format: Format
  onContentTypeChange: (contentType: Content) => void
  onContentAlignmentChange: (alignment: ContentAlignment) => void
  onContentUrlChange: (url: string | undefined) => void
}

type ContentAlignmentOptions = {
  label: string
  value: ContentAlignment
}

const contentTypeOptions: CustomRadioGroupOption[] = [
  { label: 'Картинка сверху', value: 'imageOnTop' },
  { label: 'Фон всего окна', value: 'background' },
  { label: 'Видео', value: 'video', disabled: true },
]

const contentAlignmentOptions: ContentAlignmentOptions[] = [
  { label: 'Сверху', value: 'top' },
  { label: 'По центру', value: 'center' },
  { label: 'Снизу', value: 'bottom' },
]

const Settings = (props: ContentSettingsProps) => {

  const handleContentTypeChange = (value: string) => {
    // because generics are for loosers apparently
    // (looking at you, Hero UI)
    props.onContentTypeChange(value as Content)
  }

  const handleAlignmentChange = (value: string) => {
    props.onContentAlignmentChange(value as ContentAlignment)
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) {
      props.onContentUrlChange(undefined)
      return
    }

    uploadImage(file).then(({ url }) => {
      props.onContentUrlChange(url)
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      {props.format === 'announcement' && <>
        <CustomRadioGroup
          options={contentTypeOptions}
          value={props.contentType}
          onValueChange={handleContentTypeChange}
        />
      </>}

      <ImageUploader
        classNames={{ container: 'w-full' }}
        hideSwitch
        hidePreview
        noBorder
        noPadding
        recommendedResolution="600x600"
        fileSize="До 25 Mb"
        formats={['png', 'jpeg', 'jpg', 'webp']}
        url={props.contentUrl || ''}
        onFileSelect={handleImageUpload}
        // isInvalid={!!imageUrlError}
        // errorMessage={imageUrlError?.message}
      />

      {props.contentType !== 'video' && props.format === 'announcement' && (
        <>
          <h2 className="text-[16px] leading-4.75">Выравнивание</h2>
          <CustomRadioGroup
            options={contentAlignmentOptions}
            value={props.contentAlignment}
            onValueChange={handleAlignmentChange}
          />
        </>
      )}
    </div>
  )
}

const ContentSettings = (props: ContentSettingsProps) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(props.contentType === 'background')
  }, [props.contentType])

  const handleContentToggle = (value: boolean) => {
    setEnabled(value)
    props.onContentTypeChange(value ? 'background' : 'imageOnTop')
  }

  return (
    <>
      {props.format === 'announcement'
        ? <BorderedContainer>
            <div className="w-full flex flex-col gap-6">
              <h2 className="text-[16px] leading-4.75 font-normal">Контент</h2>
              <Settings {...props} />
            </div>
          </BorderedContainer>
        : <SwitchableField
            title="Контент"
            enabled={enabled}
            onToggle={handleContentToggle}
            classNames={{
              title: 'text-[16px] leading-4.75 font-normal',
            }}
          >
            <Settings {...props} />
          </SwitchableField>
      }
    </>
  )
}

export default ContentSettings
