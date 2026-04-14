import { AgreementAndPolicy, ButtonAppearenceSettings, Input } from '@/components'
import ColorPicker from '@/components/ColorPicker'
import { CompanyLogo, ContactAcquisitionSettings, ContentPlacement, ContentSettings, RewardMessageSettings, WidgetBackgroundColor, WidgetBorderRadius } from '@/components/settings'
import CountdownSettings from '@/components/settings/InfoSettings/CountdownSettings'
import TextSettings from '@/components/TextSettings'
import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import { parseAbsoluteToLocal } from '@internationalized/date'

const ActionTimerWidgetSettings = () => {
  return (
    <div className='w-full min-w-85.5 flex flex-col gap-2.5'>
      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Оформление
      </h1>
      
      <CompanyLogo
        enabled={true}
        logoUrl={undefined}
        onToggle={() => {}}
        onLogoUrlChange={() => {}}
      />
      <WidgetBackgroundColor
        colorScheme='primary'
        backgroundColor='#FFFFFF'
        onBackgroundColorChange={() => {}}
        onColorSchemeChange={() => {}}
      />
      <ContentSettings
        format='actionTimer'
        contentAlignment='center'
        contentType='background'
        contentUrl={undefined}
        onContentUrlChange={() => {}}
        onContentAlignmentChange={() => {}}
        onContentTypeChange={() => {}}
      />
      <ContentPlacement />
      <WidgetBorderRadius
        widgetBorderRadius={15}
        onBorderRadiuschange={() => {}}
      />

      <h1 className='text-[25px] leading-7.5 font-normal text-[#060606]'>
        Абоба
      </h1>

      <BorderedContainer>
        <div className='w-full flex flex-col gap-2.5'>
          <span className='text-black text-base'>
            Cтатус
          </span>
          <div className='w-full flex flex-row gap-2.5'>
            <Input classNames={{ base: 'flex-3' }} placeholder='lemnity.ru/ads' />
            <ColorPicker
              classNames={{
                triggerButton: 'flex-1',
              }}
              initialColor='#000000'
              triggerText='Цвет бейджа'
              onColorChange={() => {}}
              popoverPlacement='bottom-end'
            />
            <ColorPicker
              classNames={{
                triggerButton: 'flex-1',
              }}
              initialColor='#000000'
              triggerText='Цвет текста'
              onColorChange={() => {}}
              popoverPlacement='bottom-end'
            />
          </div>

          <TextSettings
            text=''
            title='Заголовок'
            textColor='#000000'
            fontSize={14}
            placeholder='Укажите заголовок'
            onColorChange={() => {}}
            onFontWeightChange={() => {}}
            onTextChange={() => {}}
            onFontSizeChange={() => {}}    
          />
          <TextSettings
            text=''
            title='Подзаголовок'
            textColor='#000000'
            fontSize={14}
            placeholder='Укажите подзаголовок (если нет, оставьте пустым)'
            onColorChange={() => {}}
            onFontWeightChange={() => {}}
            onTextChange={() => {}}
            onFontSizeChange={() => {}}    
          />
          <TextSettings
            text=''
            title='Описание'
            textColor='#000000'
            fontSize={14}
            placeholder='Получите супер скидку до 30 % на покупку билета в АРТ КАФЕ.'
            onColorChange={() => {}}
            onFontWeightChange={() => {}}
            onTextChange={() => {}}
            onFontSizeChange={() => {}}    
          />

          <span className='text-black text-base'>
            Кнопка
          </span>
          <ButtonAppearenceSettings
            buttonBackgroundColor='#000000'
            buttonTextColor='#FFFFFF'
            buttonIcon='HeartDislike'
            buttonText=''
            onBackgroundColorChange={() => {}}
            onFontColorChange={() => {}}
            onTriggerTextChange={() => {}}
            onTriggerIconChange={() => {}}
          />

          <span className='text-black text-base'>
            Ссылка
          </span>
          <Input placeholder='lemnity.ru/ads' />
        </div>
      </BorderedContainer>

      <CountdownSettings
        enabled={true}
        textEnabled={true}
        text=''
        textColor='#000000'
        backgroundColor='#FFFFFF'
        date={parseAbsoluteToLocal(new Date().toISOString())}
        fontColor='#000000'
        onBackgroundColorChange={() => {}}
        onDateChange={() => {}}
        onFontColorChange={() => {}}
        onToggle={() => {}}
        onTextChange={() => {}}
        onTextColorChange={() => {}}
      />

      <ContactAcquisitionSettings
        contactAcquisitionEnabled={true}
        onContactAcquisitionToggle={() => {}}
        nameFieldEnabled={true}
        onNameFieldEnabledChange={() => {}}
        nameFieldRequired={true}
        onNameFieldRequiredChange={() => {}}
        phoneFieldEnabled={true}
        onPhoneFieldEnabledChange={() => {}}
        phoneFieldRequired={true}
        onPhoneFieldRequiredChange={() => {}}
        emailFieldEnabled={true}
        onEmailFieldEnabledChange={() => {}}
        emailFieldRequired={true}
        onEmailFieldRequiredChange={() => {}}
      />

      <AgreementAndPolicy
        variant='agreement'
        errorPath=''
        agreement={{
            enabled: true,
            color: '#000000',
            agreementUrl: '',
            policyUrl: '',
        }}
        onToggle={() => {}}
        onFontColorChange={() => {}}
        onAgreementUrlChange={() => {}}
        onPolicyUrlChange={() => {}}
      />
      
      <AgreementAndPolicy
        variant='advertisement'
        errorPath=''
        agreement={{
          enabled: true,
          color: '#000000',
          policyUrl: '',
        }}
        onToggle={() => {}}
        onFontColorChange={() => {}}
        onPolicyUrlChange={() => {}}
      />

      <RewardMessageSettings
        customColorSchemeEnabled={true}
        customDiscountBackgroundColor='#FFFFFF'
        customPromoBackgroundColor='#FFFFFF'
        description=''
        descriptionFontColor='#000000'
        descriptionFontSize={14}
        descriptionFontWeight='regular'
        discount=''
        discountFontColor='#000000'
        discountFontSize={14}
        discountFontWeight='regular'
        promo=''
        promoFontColor='#000000'
        promoFontSize={14}
        promoFontWeight='regular'
        title=''
        titleFontColor='#000000'
        titleFontSize={14}
        titleFontWeight='regular'
        rewardScreenEnabled={true}
        setCustomColorSchemeEnabled={() => {}}
        setCustomDiscountBackgroundColor={() => {}}
        setCustomPromoBackgroundColor={() => {}}
        setDescription={() => {}}
        setDescriptionFontColor={() => {}}
        setDescriptionFontSize={() => {}}
        setDescriptionFontWeight={() => {}}
        setDiscount={() => {}}
        setDiscountFontColor={() => {}}
        setDiscountFontSize={() => {}}
        setDiscountFontWeight={() => {}}
        setPromo={() => {}}
        setPromoFontColor={() => {}}
        setPromoFontSize={() => {}}
        setPromoFontWeight={() => {}}
        setRewardScreenEnabled={() => {}}
        setTitle={() => {}}
        setTitleFontColor={() => {}}
        setTitleFontSize={() => {}}
        setTitleFontWeight={() => {}}
      />
    </div>
  )
}

export default ActionTimerWidgetSettings
