import { useEffect, useMemo, useState, useId } from 'react'
import CustomSwitch from './CustomSwitch'
import SvgIcon from './SvgIcon'
import iconUpload from '@/assets/icons/upload-stub.svg'
import imageUpload from '@/assets/icons/image-upload.svg'

type ImageUploaderProps = {
  checked?: boolean
  setChecked?: (checked: boolean) => void
  title?: string
  recommendedResolution: string
  fileSize: string
  formats?: string[]
  formatsLabel?: string // подпись формата в подсказке (не влияет на accept)
  classNames?: {
    container?: string
    image?: string
    label?: string
  }
  hideSwitch?: boolean
  hidePreview?: boolean
  filename?: string
  url?: string
  onFileSelect?: (file: File | null) => void
  isInvalid?: boolean
  errorMessage?: string
  noBorder?: boolean
  noPadding?: boolean
}

function shortenFileName(name: string, max = 40): string {
  if (!name) return name
  if (name.length <= max) return name
  const dot = name.lastIndexOf('.')
  const ext = dot > -1 ? name.slice(dot) : ''
  const base = dot > -1 ? name.slice(0, dot) : name
  const room = max - ext.length
  const head = Math.ceil((room - 3) / 2)
  const tail = Math.floor((room - 3) / 2)
  return `${base.slice(0, Math.max(0, head))}...${base.slice(Math.max(0, base.length - tail))}${ext}`
}

const ImageUploader = ({
  checked,
  setChecked = () => {},
  title,
  recommendedResolution,
  fileSize,
  formats = ['png', 'jpeg'],
  formatsLabel,
  classNames = {
    container: '',
    image: '',
    label: ''
  },
  hideSwitch,
  hidePreview,
  filename,
  url,
  onFileSelect,
  isInvalid,
  errorMessage,
  noBorder,
  noPadding
}: ImageUploaderProps) => {
  // Контролируемый подход: пропсы — источник правды.
  // Локально храним только выбранный в этом сеансе файл и blob-url для превью.
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const previewUrl = useMemo<string | null>(() => blobUrl ?? url ?? null, [blobUrl, url])
  const displayName = useMemo(
    () => shortenFileName(localFile?.name ?? filename ?? 'Выбрать файл'),
    [localFile?.name, filename]
  )
  const inputId = useId()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLocalFile(file)
    onFileSelect?.(file)

    setBlobUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg ${noPadding ? '' : 'p-3'} ${noBorder ? '' : 'border border-gray-200'} ${classNames.container}`}
    >
      {(title || !hideSwitch) && <div className="flex flex-row gap-2">
        {title ? <span className="text-black">{title}</span> : null}
        {hideSwitch ? null : (
          <CustomSwitch
            isSelected={checked}
            onValueChange={setChecked}
            selectedColor="group-data-[selected=true]:!bg-[#1A52DB]"
            className="ml-auto"
            size="sm"
          />
        )}
      </div>}
      <div className="flex flex-row gap-3 w-full min-w-0 items-center">
        {!hidePreview && <img
          src={previewUrl || imageUpload}
          alt="image"
          className="w-14 h-14 object-cover rounded-[5px]"
        />}
        <label
          htmlFor={inputId}
          className={`@container flex-1 min-w-0 h-14 flex items-center justify-center gap-3 px-3 py-2 bg-[#D7DBFF]/24 hover:bg-[#E4E4E7] border border-[#E8E8E8] rounded-md cursor-pointer transition-colors overflow-hidden ${classNames.label}`}
        >
          <SvgIcon src={iconUpload} size={20} className="text-black w-min" />
          <div className="min-w-0 flex-1 overflow-hidden hidden @min-[130px]:block">
            <span className="truncate text-sm text-gray-700">{displayName}</span>
          </div>
          <input
            id={inputId}
            type="file"
            accept={`image/${formats.join(', image/')}`}
            className={`hidden ${classNames.image}`}
            onChange={handleFileChange}
          />
        </label>
        <span className="text-sm text-gray-600 shrink leading-tight">
          Размер файла: {fileSize}
          <br />
          Рекомендуемый размер: {recommendedResolution}
          <br />
          Формат: {formatsLabel ?? formats.join(', ')}
        </span>
      </div>
      {checked && isInvalid && <span className="text-sm text-red-500">{errorMessage}</span>}
    </div>
  )
}

export default ImageUploader
