import { Slider } from '@heroui/slider'

import { uploadImage } from '@/api/upload'
import ImageUploader from '@/components/ImageUploader'
import SwitchableField from '@/components/SwitchableField'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'

export const COMPANY_LOGO_DEFAULT_SIZE = 36
const COMPANY_LOGO_MIN_SIZE = 16
const COMPANY_LOGO_MAX_SIZE = 80

type CompanyLogoProps = {
  enabled: boolean
  logoUrl?: string
  onLogoUrlChange: (value: string | undefined) => void
  onToggle: (nextEnabled: boolean) => void
  /** Размер логотипа (px). Если передан onSizeChange — показываем ползунок масштаба */
  size?: number
  onSizeChange?: (value: number) => void
}

const CompanyLogo = (props: CompanyLogoProps) => {
  const handleImageUpload = (file: File | null) => {
    if (!file) {
      props.onLogoUrlChange(undefined)
      return
    }

    uploadImage(file).then(({ url }) => {
      props.onLogoUrlChange(url)
    })
  }

  const size = props.size ?? COMPANY_LOGO_DEFAULT_SIZE

  return (
    <SwitchableField
      title="Логотип компании"
      enabled={props.enabled}
      onToggle={props.onToggle}
      classNames={{
        title: 'text-[16px] leading-4.75 font-normal',
      }}
    >
      <div className="w-full flex flex-col gap-3">
        <ImageUploader
          classNames={{ container: 'w-full' }}
          hideSwitch
          hidePreview
          noBorder
          noPadding
          recommendedResolution="600x600"
          fileSize="До 25 Mb"
          formats={['png', 'jpeg', 'jpg', 'webp']}
          url={props.logoUrl || ''}
          onFileSelect={handleImageUpload}
          // isInvalid={!!imageUrlError}
          // errorMessage={imageUrlError?.message}
        />

        {props.onSizeChange && (
          <BorderedContainer>
            <div className="w-full flex flex-col gap-3.5">
              <div className="flex flex-row justify-between">
                <h2 className="text-[16px] leading-4.75">Размер логотипа</h2>
                <span className="text-[16px] leading-4.75 font-medium">
                  {size}px
                </span>
              </div>

              <Slider
                value={size}
                onChange={value => props.onSizeChange?.(Number(value))}
                size="sm"
                defaultValue={COMPANY_LOGO_DEFAULT_SIZE}
                maxValue={COMPANY_LOGO_MAX_SIZE}
                minValue={COMPANY_LOGO_MIN_SIZE}
                step={1}
                aria-label="Размер логотипа"
              />
            </div>
          </BorderedContainer>
        )}
      </div>
    </SwitchableField>
  )
}

export default CompanyLogo
