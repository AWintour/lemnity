import { useRef } from 'react'
import { Input } from '@heroui/input'
import { cn } from '@heroui/theme'

import SwitchableField from '@/components/SwitchableField'
import ColorPicker from '@/components/ColorPicker'
import { useElementSize } from '@/hooks/useElementSize'

const inputStyles = {
  base: 'min-w-76 flex-1',
  inputWrapper: cn(
    'border bg-white border-[#E8E8E8] rounded-[5px]',
    'shadow-none h-12.75 px-2.5',
  ),
  input: 'placeholder:text-[#AAAAAA] text-base',
}

const agreementTitle = 'Согласие и политика'
const advertisementTitle = 'Рекламная информация'

const agreementDisclaimer = 'Я даю Согласие на обработку персональных данных \
в соотвествии с Политикой конфиденциальности'
const advertisementDisclaimer = 'Нажимая на кнопку, вы даёте своё согласие \
на получение рекламно-информационной рассылки.'

type AgreementAndPolicyProps = {
  variant: 'agreement' | 'advertisement'
  agreement: {
    enabled: boolean
    policyUrl: string
    agreementUrl?: string
    color: string
  }
  onToggle: (nextEnabled: boolean) => void
  onFontColorChange: (value: string) => void
  onAgreementUrlChange?: (value: string) => void
  onPolicyUrlChange: (value: string) => void
}

const AgreementAndPolicy = (props: AgreementAndPolicyProps) => {
  const errors: any[] = []

  const containerDivRef = useRef<HTMLDivElement>(null)
  const { width: containerWidth } = useElementSize(containerDivRef)

  return (
    <SwitchableField
      title={
        props.variant === 'agreement'
          ? agreementTitle
          : advertisementTitle
      }
      enabled={props.agreement.enabled}
      onToggle={props.onToggle}
    >
      <div
        ref={containerDivRef}
        className="flex flex-col gap-2.5 @container"
      >
        <div
          className="flex flex-row gap-2.5 flex-wrap @min-[467px]:flex-nowrap"
        >
          <span
            className={cn(
              'w-full min-h-12.75 px-2.5 flex items-center',
              'border bg-white border-[#E8E8E8] rounded-[5px]',
              'text-[13px] text-[#AFAFAF]',
            )}
          >
            {props.variant === 'agreement'
              ? agreementDisclaimer
              : advertisementDisclaimer}
          </span>

          <ColorPicker
            popoverPlacement='bottom-end'
            triggerText={
              containerWidth < 467
                ? 'Цвет текста'
                : undefined
            }
            initialColor={props.agreement.color}
            onColorChange={props.onFontColorChange}
          />
        </div>

        {props.variant === 'agreement' && <>
          <span className="text-lg font-normal">URL согласие</span>
          <Input
            variant="bordered"
            placeholder="lemnity.ru/policy"
            classNames={inputStyles}
            value={props.agreement.agreementUrl}
            isInvalid={props.agreement.enabled && errors.some(
              e => e.path.endsWith('agreementUrl')
            )}
            errorMessage={
              errors
                .find(e => e.path.endsWith('agreementUrl'))
                ?.message
            }
            onValueChange={props.onAgreementUrlChange}
          />
        </>}
        
        <span className="text-lg font-normal">
          URL политики обработки персональных данных
        </span>
        <Input
          variant="bordered"
          placeholder="lemnity.ru/policy"
          classNames={inputStyles}
          value={props.agreement.policyUrl}
          isInvalid={props.agreement.enabled && errors.some(
            e => e.path.endsWith('policyUrl')
          )}
          errorMessage={
            errors
              .find(e => e.path.endsWith('policyUrl'))
              ?.message
          }
          onValueChange={props.onPolicyUrlChange}
        />
      </div>
    </SwitchableField>
  )
}

export default AgreementAndPolicy
