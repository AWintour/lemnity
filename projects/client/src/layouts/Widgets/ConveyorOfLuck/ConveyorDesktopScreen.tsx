import DynamicFieldsForm from '../Common/DynamicFieldsForm/DynamicFieldsForm'
import ConveyorReel from './ConveyorReel'
import RewardContent from '../Common/RewardContent/RewardContent'
import useWidgetSettingsStore, { useWidgetStaticDefaults } from '@/stores/widgetSettingsStore'
import { useWheelOfFortuneSettings } from '@/layouts/Widgets/WheelOfFortune/hooks'
import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'
import type { WidgetLeadFormValues, WidgetPreviewScreen } from '../registry'
import usePreviewRuntimeStore from '@/stores/previewRuntimeStore'
import type { PublicWheelSpinResponse } from '@/common/api/publicApi'

type ConveyorDesktopScreenProps = {
  screen: WidgetPreviewScreen
  onSubmit: (values: WidgetLeadFormValues) => void
}

// «Конвейер Удачи» — клон «Колеса фортуны», но визуал — вертикальный барабан (лента),
// а не круг. Логика спина/формы/призового экрана общая с колесом (runtime-ключи wheel.*).
const ConveyorDesktopScreen = ({ screen, onSubmit }: ConveyorDesktopScreenProps) => {
  const spinTrigger = usePreviewRuntimeStore(s => s.counters['wheel.spin'] ?? 0)
  const winningSectorId = usePreviewRuntimeStore(
    s => (s.values['wheel.winningSectorId'] as string | null | undefined) ?? undefined
  )
  const spinStatus = usePreviewRuntimeStore(
    s => s.values['wheel.status'] as 'idle' | 'spinning' | 'locked' | undefined
  )
  const wheelResult = usePreviewRuntimeStore(
    s => s.values['wheel.result'] as PublicWheelSpinResponse | undefined
  )
  const staticDefaults = useWidgetStaticDefaults()
  const companyLogo = useWidgetSettingsStore(s => s?.settings?.fields?.companyLogo)
  const templateDefaults = staticDefaults?.fields.template.templateSettings
  const templateSettings = useWidgetSettingsStore(
    s => s?.settings?.fields?.template?.templateSettings
  )
  const contentPosition = templateSettings?.contentPosition ?? templateDefaults?.contentPosition
  // Цвет общего фона модалки — для окантовки указателя барабана («вырез»).
  const modalBg =
    (templateSettings?.colorScheme ?? templateDefaults?.colorScheme) === 'custom'
      ? (templateSettings?.customColor ?? templateDefaults?.customColor ?? '#725DFF')
      : '#725DFF'

  const { settings } = useWheelOfFortuneSettings()
  const { settings: fieldsSettings } = useFieldsSettings()
  if (!settings) return null

  const sectors = settings.sectors

  const renderForm = screen === 'main' || screen === 'panel'
  const handleAction = (values: WidgetLeadFormValues) => onSubmit(values)
  const submitDisabled = spinStatus === 'spinning' || spinStatus === 'locked'
  const isEditPage =
    typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '').endsWith('/edit')
  const discountTrimmed = wheelResult?.sector?.text?.trim()
  const promoTrimmed = wheelResult?.sector?.promo?.trim()
  const content = renderForm ? (
    <DynamicFieldsForm onSubmit={handleAction} submitDisabled={submitDisabled} />
  ) : (
    <RewardContent
      companyLogo={companyLogo}
      discountText={isEditPage ? discountTrimmed || 'Скидка 10%' : discountTrimmed}
      promo={isEditPage ? promoTrimmed || 'PROMO-10' : promoTrimmed}
      onWin={fieldsSettings.messages?.onWin}
    />
  )

  const renderReel = (side: 'left' | 'right') => {
    const className = side === 'left' ? 'pr-5' : 'pl-5'

    return (
      <ConveyorReel
        className={className}
        winningSectorId={winningSectorId}
        sectorsRandomize={sectors.randomize}
        sectors={sectors.items}
        spinTrigger={spinTrigger}
        borderColor={settings?.borderColor}
        borderThickness={settings?.borderThickness}
        backgroundColor={modalBg}
        cardRadius={settings?.cardRadius}
        pointerSide={side === 'left' ? 'right' : 'left'}
      />
    )
  }

  const showReel = screen !== 'prize'

  return (
    <div
      className={`grid grid-cols-${screen !== 'prize' ? '2' : '1'} p-4 items-center justify-center w-full min-h-full ${screen === 'panel' ? 'py-10' : ''}`}
    >
      {contentPosition === 'left' ? (
        <>
          {content}
          {showReel ? renderReel('left') : null}
        </>
      ) : (
        <>
          {showReel ? renderReel('right') : null}
          {content}
        </>
      )}
    </div>
  )
}

export default ConveyorDesktopScreen
