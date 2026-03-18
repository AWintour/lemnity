import { uploadImage } from '@/api/upload'
import ImageUploader from '@/components/ImageUploader'
import SwitchableField from '@/components/SwitchableField'

type CompanyLogoProps = {
  enabled: boolean
  logoUrl?: string
  onLogoUrlChange: (value: string | undefined) => void
  onToggle: (nextEnabled: boolean) => void
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

  return (
    <SwitchableField
      title="Логотип компании"
      enabled={props.enabled}
      onToggle={props.onToggle}
      classNames={{
        title: 'text-[16px] leading-4.75 font-normal',
      }}
    >
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
    </SwitchableField>
  )
}

export default CompanyLogo
