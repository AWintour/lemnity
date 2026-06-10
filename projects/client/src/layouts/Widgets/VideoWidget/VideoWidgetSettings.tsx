import { useId } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Input } from '@heroui/input'
import { cn } from '@heroui/theme'

import {
  WidgetAppearanceSettings,
  MobileVersionSettings,
} from '@/components/settings'
import { SwitchableField, ImageUploader } from '@/components'
import TextSettings from '@/components/TextSettings'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import ButtonAppearenceSettings from '@/layouts/WidgetSettings/DisplaySettingsTab/ButtonAppearenceSettings/ButtonAppearenceSettings'
import DisableBranding from '@/layouts/WidgetSettings/FieldsSettingsTab/DisableBranding/DisableBranding'
import ContactsField from '@/layouts/WidgetSettings/FieldsSettingsTab/ContactsField/ContactsField'
import AgreementPoliciesField from '@/layouts/WidgetSettings/FieldsSettingsTab/AgreementPoliciesField/AgreementPoliciesField'
import AdsInfoField from '@/layouts/WidgetSettings/FieldsSettingsTab/AdsInfoField/AdsInfoField'

import useWidgetSettingsStore from '@/stores/widgetSettingsStore'
import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
import { uploadImage, uploadVideo } from '@/api/upload'
import type {
  VideoWidgetType,
} from '@lemnity/widget-config/widgets/video-widget'
import { videoWidgetDefaults } from './defaults'

const MAX_VIDEOS = 3

const urlInputClassNames = {
  base: 'min-w-76 flex-1',
  inputWrapper: cn(
    'rounded-md border bg-white border-[#E8E8E8] rounded-[5px]',
    'shadow-none h-12.5 px-2.5',
  ),
  input: 'placeholder:text-[#AAAAAA] text-base',
}

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

type VideoUploaderProps = {
  videos: string[]
  onAdd: (url: string) => void
  onRemove: (index: number) => void
}

const VideoUploader = ({ videos, onAdd, onRemove }: VideoUploaderProps) => {
  const inputId = useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadVideo(file)
      .then(({ url }) => onAdd(url))
      .catch(() => {/* TODO: показать ошибку */})
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg p-3 border border-gray-200">
      <div className="flex flex-row items-center justify-between">
        <span className="text-[25px] leading-7.5 font-normal text-[#060606]">
          Загрузить видео
        </span>
        <span className="text-[#AAAAAA] text-base">Максимум {MAX_VIDEOS}</span>
      </div>

      {videos.length < MAX_VIDEOS && (
        <div className="flex flex-row gap-3 w-full min-w-0 items-center">
          <label
            htmlFor={inputId}
            className={cn(
              '@container flex-1 min-w-0 h-14 flex items-center gap-3 px-3 py-2',
              'bg-[#D7DBFF]/24 hover:bg-[#E4E4E7] border border-[#E8E8E8] rounded-md',
              'cursor-pointer transition-colors overflow-hidden text-black',
            )}
          >
            <CameraIcon />
            <span className="truncate text-sm text-gray-700">
              Нажмите чтобы выбрать файл
            </span>
            <input
              id={inputId}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleChange}
            />
          </label>
          <span className="text-sm text-gray-600 shrink leading-tight">
            Размер файла: до 20 Мб
            <br />
            Рекомендуемый размер: 9x16 -
            <br />
            mp4, webm (без прозрачности)
          </span>
        </div>
      )}

      {videos.length > 0 && (
        <div className="flex flex-row flex-wrap gap-3">
          {videos.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative w-36 aspect-[9/16] rounded-2xl overflow-hidden bg-black"
            >
              <video
                src={url || undefined}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <button
                type="button"
                aria-label="Удалить видео"
                className={cn(
                  'absolute top-2 right-2 w-7 h-7 flex items-center justify-center',
                  'rounded-full text-white drop-shadow',
                  'hover:bg-black/30 transition-colors',
                )}
                onClick={() => onRemove(i)}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const VideoWidgetSettings = () => {
  const {
    videos,
    posterEnabled,
    posterUrl,
    muted,
    loop,
    showControls,
    showProgressBar,

    title,
    titleColor,
    buttonText,
    buttonFontColor,
    buttonBackgroundColor,
    icon,
    link,

    mobileEnabled,
    triggerType,
    imageUrl,
    triggerText,
    triggerFontColor,
    triggerBackgroundColor,

    formEnabled,
    formTitleFontSize,
    brandingEnabled,
  } = useWidgetSettingsStore(
    useShallow(s => {
      const widget = s.settings?.widget as VideoWidgetType
      const video = widget.videoSettings
      const info = widget.infoSettings
      const mobile = widget.mobileSettings
      const d = videoWidgetDefaults

      return {
        videos: video.videos ?? d.videoSettings.videos,
        posterEnabled: video.posterEnabled ?? d.videoSettings.posterEnabled,
        posterUrl: video.posterUrl ?? d.videoSettings.posterUrl,
        muted: video.muted ?? d.videoSettings.muted,
        loop: video.loop ?? d.videoSettings.loop,
        showControls: video.showControls ?? d.videoSettings.showControls,
        showProgressBar: video.showProgressBar ?? d.videoSettings.showProgressBar,

        title: info.title ?? d.infoSettings.title,
        titleColor: info.titleColor ?? d.infoSettings.titleColor,
        buttonText: info.buttonText ?? d.infoSettings.buttonText,
        buttonFontColor: info.buttonFontColor ?? d.infoSettings.buttonFontColor,
        buttonBackgroundColor:
          info.buttonBackgroundColor ?? d.infoSettings.buttonBackgroundColor,
        icon: info.icon ?? d.infoSettings.icon,
        link: info.link ?? d.infoSettings.link,

        mobileEnabled: mobile.mobileEnabled ?? d.mobileSettings.mobileEnabled,
        triggerType: mobile.triggerType ?? d.mobileSettings.triggerType,
        imageUrl: mobile.imageUrl ?? d.mobileSettings.imageUrl,
        triggerText: mobile.triggerText ?? d.mobileSettings.triggerText,
        triggerFontColor:
          mobile.triggerFontColor ?? d.mobileSettings.triggerFontColor,
        triggerBackgroundColor:
          mobile.triggerBackgroundColor ?? d.mobileSettings.triggerBackgroundColor,

        formEnabled: widget.formEnabled ?? d.formEnabled,
        formTitleFontSize: widget.formTitleFontSize ?? d.formTitleFontSize,
        brandingEnabled: widget.brandingEnabled ?? d.brandingEnabled,
      }
    })
  )

  const {
    settings: fields,
    setFormTitle,
    setFormButtonText,
    setCompanyLogoEnabled: setFormLogoEnabled,
    setCompanyLogoFile: setFormLogoFile,
  } = useFieldsSettings()
  const formTitle = fields?.formTexts?.title
  const formButton = fields?.formTexts?.button
  const formLogo = fields?.companyLogo

  const handleFormLogo = (file: File | null) => {
    if (!file) {
      setFormLogoFile('', undefined)
      return
    }
    uploadImage(file).then(({ url }) => setFormLogoFile(file.name, url)).catch(() => {})
  }

  const setCompanyLogoEnabled = useWidgetSettingsStore(s => s.setVideoWidgetCompanyLogoEnabled)
  const setCompanyLogoUrl = useWidgetSettingsStore(s => s.setVideoWidgetCompanyLogoUrl)
  const setWidgetColorScheme = useWidgetSettingsStore(s => s.setVideoWidgetColorScheme)
  const setWidgetBackgroundColor = useWidgetSettingsStore(s => s.setVideoWidgetBackgroundColor)
  const setBorderRadius = useWidgetSettingsStore(s => s.setVideoWidgetBorderRadius)
  const resetColors = useWidgetSettingsStore(s => s.resetVideoWidgetColors)
  const position = useWidgetSettingsStore(
    s => (s.settings?.widget as VideoWidgetType | undefined)?.appearence.position
      ?? videoWidgetDefaults.appearence.position
  )
  const setPosition = useWidgetSettingsStore(s => s.setVideoWidgetPosition)

  const addVideo = useWidgetSettingsStore(s => s.addVideoWidgetVideo)
  const removeVideo = useWidgetSettingsStore(s => s.removeVideoWidgetVideo)
  const setPosterEnabled = useWidgetSettingsStore(s => s.setVideoWidgetPosterEnabled)
  const setPosterUrl = useWidgetSettingsStore(s => s.setVideoWidgetPosterUrl)
  const setMuted = useWidgetSettingsStore(s => s.setVideoWidgetMuted)
  const setLoop = useWidgetSettingsStore(s => s.setVideoWidgetLoop)
  const setShowControls = useWidgetSettingsStore(s => s.setVideoWidgetShowControls)
  const setShowProgressBar = useWidgetSettingsStore(s => s.setVideoWidgetShowProgressBar)

  const setTitle = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenTitle)
  const setTitleFontWeight = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenTitleFontWeight)
  const setTitleColor = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenTitleColor)
  const setButtonText = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenButtonText)
  const setButtonFontColor = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenButtonFontColor)
  const setButtonBackgroundColor = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenButtonBackgroundColor)
  const setButtonIcon = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenIcon)
  const setButtonLink = useWidgetSettingsStore(s => s.setVideoWidgetInfoScreenLink)

  const setMobileEnabled = useWidgetSettingsStore(s => s.setVideoWidgetMobileEnabled)
  const setMobileTriggerType = useWidgetSettingsStore(s => s.setVideoWidgetMobileTriggerType)
  const setMobileImageUrl = useWidgetSettingsStore(s => s.setVideoWidgetMobileImageUrl)
  const setMobileTriggerText = useWidgetSettingsStore(s => s.setVideoWidgetMobileTriggerText)
  const setMobileTriggerFontColor = useWidgetSettingsStore(s => s.setVideoWidgetMobileTriggerFontColor)
  const setMobileTriggerBackgroundColor = useWidgetSettingsStore(s => s.setVideoWidgetMobileTriggerBackgroundColor)
  const setFormEnabled = useWidgetSettingsStore(s => s.setVideoWidgetFormEnabled)
  const setFormTitleFontSize = useWidgetSettingsStore(s => s.setVideoWidgetFormTitleFontSize)
  const setBrandingEnabled = useWidgetSettingsStore(s => s.setVideoWidgetBrandingEnabled)

  const handlePosterSelect = (file: File | null) => {
    if (!file) {
      setPosterUrl(undefined)
      return
    }
    uploadImage(file).then(({ url }) => setPosterUrl(url)).catch(() => {})
  }

  return (
    <div className='w-full px-4.75 flex flex-col gap-2.5'>
      {/* Над логотипом: загрузка видео + превью */}
      <VideoUploader videos={videos} onAdd={addVideo} onRemove={removeVideo} />

      <ImageUploader
        title='Превью видео'
        checked={posterEnabled}
        setChecked={setPosterEnabled}
        recommendedResolution='9x16 - png, jpg, jpeg, webp'
        fileSize='менее 1 Мб'
        formats={['png', 'jpg', 'jpeg', 'webp']}
        url={posterUrl}
        onFileSelect={handlePosterSelect}
      />
      <span className='text-sm text-[#AAAAAA] -mt-1'>
        Если отключить, видео будет проигрываться сразу
      </span>

      <WidgetAppearanceSettings
        defaults={videoWidgetDefaults}
        resetColors={resetColors}
        setBorderRadius={setBorderRadius}
        setCompanyLogoEnabled={setCompanyLogoEnabled}
        setCompanyLogoUrl={setCompanyLogoUrl}
        setWidgetBackgroundColor={setWidgetBackgroundColor}
        setWidgetColorScheme={setWidgetColorScheme}
      />

      {/* Поведение видео */}
      <SwitchableField title='Без звука (mute)' enabled={muted} onToggle={setMuted} />
      <SwitchableField title='Зациклить' enabled={loop} onToggle={setLoop} />
      <SwitchableField title='Показывать кнопки управления' enabled={showControls} onToggle={setShowControls} />
      <SwitchableField title='Показывать прогресс-бар' enabled={showProgressBar} onToggle={setShowProgressBar} />

      {/* Оверлей: заголовок + CTA */}
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Оверлей
      </h1>
      <BorderedContainer>
        <div className='w-full flex flex-col'>
          <TextSettings
            text={title}
            textColor={titleColor}
            title='Заголовок'
            placeholder='Укажите заголовок'
            onTextChange={setTitle}
            onFontWeightChange={setTitleFontWeight}
            onColorChange={setTitleColor}
          />
        </div>
      </BorderedContainer>
      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <h2 className='text-[16px] leading-4.75'>Кнопка</h2>
          <ButtonAppearenceSettings
            onTriggerTextChange={setButtonText}
            onTriggerIconChange={setButtonIcon}
            onFontColorChange={setButtonFontColor}
            onBackgroundColorChange={setButtonBackgroundColor}
            buttonText={buttonText}
            buttonTextColor={buttonFontColor}
            buttonBackgroundColor={buttonBackgroundColor}
            buttonIcon={icon}
          />
          <h2 className='text-[16px] leading-4.75'>Ссылка</h2>
          <Input
            value={link}
            onValueChange={setButtonLink}
            placeholder='lemnity.ru/ads'
            classNames={urlInputClassNames}
          />
        </div>
      </BorderedContainer>

      {/* Положение виджета на странице */}
      <div className='flex flex-col gap-3 rounded-[14px] border border-gray-200 px-4.5 py-4'>
        <span className='text-black text-base font-medium'>Положение виджета</span>
        <div className='flex flex-row gap-3'>
          {(['bottom-left', 'bottom-right'] as const).map(pos => {
            const selected = position === pos
            return (
              <button
                key={pos}
                type='button'
                aria-label={pos}
                onClick={() => setPosition(pos)}
                className={cn(
                  'relative w-22 h-22 rounded-[16px] border-2 bg-white transition-colors',
                  selected ? 'border-[#5951E5]' : 'border-[#E4E4E7] hover:border-[#CFCFCF]',
                )}
              >
                <span
                  className={cn(
                    'absolute bottom-3 w-3 h-3 rounded-full transition-colors',
                    pos === 'bottom-left' ? 'left-3' : 'right-3',
                    selected ? 'bg-[#5951E5]' : 'bg-[#D4D4D8]',
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Форма захвата лида (показывается после нажатия CTA) */}
      <SwitchableField
        title='Форма'
        switchLabel='Показывать форму после нажатия кнопки'
        enabled={formEnabled}
        onToggle={setFormEnabled}
      >
        <div className='flex flex-col gap-2.5 pt-3'>
          <ImageUploader
            title='Логотип компании'
            checked={formLogo?.enabled ?? true}
            setChecked={setFormLogoEnabled}
            recommendedResolution='200x50'
            fileSize='менее 2 Мб'
            formats={['png', 'jpg', 'jpeg', 'webp', 'svg']}
            filename={formLogo?.fileName}
            url={formLogo?.url}
            onFileSelect={handleFormLogo}
          />
          <BorderedContainer>
            <div className='w-full flex flex-col'>
              <TextSettings
                text={formTitle?.text ?? ''}
                textColor={formTitle?.color ?? '#000000'}
                title='Заголовок формы'
                placeholder='Оставьте заявку и мы вам перезвоним'
                fontSize={formTitleFontSize}
                onFontSizeChange={setFormTitleFontSize}
                onTextChange={t => setFormTitle(t, formTitle?.color ?? '#000000')}
                onFontWeightChange={() => {}}
                onColorChange={c => setFormTitle(formTitle?.text ?? '', c)}
              />
            </div>
          </BorderedContainer>
          <BorderedContainer>
            <div className='w-full flex flex-col gap-2.5'>
              <h2 className='text-[16px] leading-4.75'>Кнопка формы</h2>
              <ButtonAppearenceSettings
                buttonText={formButton?.text}
                buttonTextColor={formButton?.color ?? '#FFFFFF'}
                buttonBackgroundColor={formButton?.backgroundColor ?? '#FFB400'}
                buttonIcon={formButton?.icon as never}
                onTriggerTextChange={t =>
                  setFormButtonText(t, formButton?.color ?? '#FFFFFF', formButton?.backgroundColor ?? '#FFB400', formButton?.icon ?? 'rocket')}
                onFontColorChange={c =>
                  setFormButtonText(formButton?.text ?? '', c, formButton?.backgroundColor ?? '#FFB400', formButton?.icon ?? 'rocket')}
                onBackgroundColorChange={bg =>
                  setFormButtonText(formButton?.text ?? '', formButton?.color ?? '#FFFFFF', bg, formButton?.icon ?? 'rocket')}
                onTriggerIconChange={ic =>
                  setFormButtonText(formButton?.text ?? '', formButton?.color ?? '#FFFFFF', formButton?.backgroundColor ?? '#FFB400', ic)}
              />
            </div>
          </BorderedContainer>
          <ContactsField />
          <AgreementPoliciesField />
          <AdsInfoField />
        </div>
      </SwitchableField>

      <MobileVersionSettings
        enabled={mobileEnabled}
        triggerType={triggerType}
        imageUrl={imageUrl}
        triggerText={triggerText}
        triggerFontColor={triggerFontColor}
        triggerBackgroundColor={triggerBackgroundColor}
        onToggle={setMobileEnabled}
        onTriggerTypeChange={setMobileTriggerType}
        onImageUrlChange={setMobileImageUrl}
        onTriggerTextChange={setMobileTriggerText}
        onTriggerFontColorChange={setMobileTriggerFontColor}
        onTriggerBackgroundColorChange={setMobileTriggerBackgroundColor}
      />

      <DisableBranding
        enabled={brandingEnabled}
        onBrandingEnabledToggle={setBrandingEnabled}
      />
    </div>
  )
}

export default VideoWidgetSettings
