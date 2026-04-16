import { uploadImage } from '@/api/upload'
import CustomRadioGroup, {
  type CustomRadioGroupOption,
} from '@/components/CustomRadioGroup'
import ImageUploader from '@/components/ImageUploader'
import SwitchableField from '@/components/SwitchableField'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'

type Content = 'background' | 'imageOnTop' | 'video' | 'imageOnSide'
type ContentAlignment = 'top' | 'center' | 'bottom' | 'left' | 'right'

export type ContentSettingsProps<
  T extends ContentAlignment = ContentAlignment,
  K extends Content = Content
> = {
  contentType?: K
  contentAlignment?: T
  contentUrl?: string
  contentEnabled?: boolean
  format: 'countdown' | 'announcement' | 'actionTimer'
  onContentTypeChange?: (contentType: K) => void
  onContentToggle?: (enabled: boolean) => void
  onContentAlignmentChange?: (alignment: T) => void
  onContentUrlChange: (url: string | undefined) => void
}

type ContentAlignmentOptions = {
  label: string
  value: ContentAlignment
}

const announcementContentTypeOptions: CustomRadioGroupOption[] = [
  { label: 'Картинка сверху', value: 'imageOnTop' },
  { label: 'Фон всего окна', value: 'background' },
  { label: 'Видео', value: 'video', disabled: true },
]

const actionTimerContentTypeOptions: CustomRadioGroupOption[] = [
  { label: 'Картинка сбоку', value: 'imageOnSide' },
  { label: 'Фон всего окна', value: 'background' },
]

const announcementContentAlignmentOptions: ContentAlignmentOptions[] = [
  { label: 'Сверху', value: 'top' },
  { label: 'По центру', value: 'center' },
  { label: 'Снизу', value: 'bottom' },
]

const actionTimerContentAlignmentOptions: ContentAlignmentOptions[] = [
  { label: 'Слева', value: 'left' },
  { label: 'По центру', value: 'center' },
  { label: 'Справа', value: 'right' },
]

const Settings = <
  T extends ContentAlignment,
  K extends Content
>(
  props: ContentSettingsProps<T, K>
) => {
  const contentTypeOptions = props.format === 'announcement'
    ? announcementContentTypeOptions
    : actionTimerContentTypeOptions
  const contentAlignmentOptions = props.format === 'announcement'
    ? announcementContentAlignmentOptions
    : actionTimerContentAlignmentOptions
  
  const showContentTypeSettings =
    props.format === 'announcement' || props.format === 'actionTimer'
  const showAlignmentSettings =
    props.contentType !== 'video' && (
      props.format === 'announcement' || props.format === 'actionTimer'
    )

  const handleContentTypeChange = (value: string) => {
    // because generics are for loosers apparently
    // (looking at you, Hero UI)
    props?.onContentTypeChange?.(value as K)
  }

  const handleAlignmentChange = (value: string) => {
    props?.onContentAlignmentChange?.(value as T)
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
      {showContentTypeSettings && (
        <CustomRadioGroup
          options={contentTypeOptions}
          value={props.contentType}
          onValueChange={handleContentTypeChange}
        />
      )}

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

      {showAlignmentSettings && (
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

const ContentSettings = <
  T extends ContentAlignment,
  K extends Content
>(
  props: ContentSettingsProps<T, K>
) => {
  const handleContentToggle = (value: boolean) => {
    props?.onContentToggle?.(value)
  }

  return (
    <>
      {props.format === 'announcement' || props.format === 'actionTimer'
        ? <BorderedContainer>
            <div className="w-full flex flex-col gap-6">
              <h2 className="text-[16px] leading-4.75 font-normal">Контент</h2>
              <Settings {...props} />
            </div>
          </BorderedContainer>
        : <SwitchableField
            title="Контент"
            enabled={props.contentEnabled}
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
