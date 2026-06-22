import BorderedContainer from '@/layouts/BorderedContainer/BorderedContainer'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import Header from '@/layouts/Header/Header'
import { useAppDispatch, useAppSelector } from '@/stores/redux/hooks'
import { paymentWidgetOpenChanged, selectPaymentPlan } from '@/stores/redux/paymentSlice'
import { Button } from '@heroui/button'
import { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from '@heroui/radio'
import { cn } from '@heroui/theme'
import { useState } from 'react'

import addIcon from '@/assets/icons/add.svg'
import { SvgIcon } from '@/components'

type TAccountPageTabs = 'account' | 'referral'

type TCustomRadioProps = {
  label: string
  type: TAccountPageTabs
  isSelected?: boolean
}

const CustomRadio = ({ label, type, isSelected }: TCustomRadioProps) => {
  const classNames: RadioProps['classNames'] = {
    base: cn(
      'rounded-[5px] px-2.5 h-[30px] ml-2.5',
      'data-[selected=true]:bg-[#D7DBFF]',
      'justify-center gap-0',
      !isSelected && 'border border-[#E8E8E8] bg-white'
    ),
    // this whole component is smoke and mirrors anyway,
    // so we can hide the radio button completely >w<
    wrapper: cn(
      'absolute w-0 h-0 min-w-0 min-h-0 opacity-0 overflow-hidden',
      'pointer-events-none',
    ),
    control: 'w-0 h-0 min-w-0 min-h-0',
    labelWrapper: 'm-0 p-0',
    label: 'm-0 text-center inline-block',
  }

  return (
    <Radio value={type} classNames={classNames}>
      {label}
    </Radio>
  )
}

const AccountPage = () => {
  const [currentTab, setCurrentTab] = useState<TAccountPageTabs>('account')

  const dispatch = useAppDispatch()

  const plan = useAppSelector(selectPaymentPlan)

  // const radioGroupClassNames: RadioGroupProps['classNames'] = {
  //   wrapper: 'justify-between',
  //   base: 'px-2',
  // }

  const handleTabChange = (value: string) => {
    setCurrentTab(value as TAccountPageTabs)
  }

  const handleChangePaymentPlan = () => {
    dispatch(paymentWidgetOpenChanged(true))
  }

  return (
    <div className='h-full flex flex-col'>
      <Header />
      <DashboardLayout>
        <h1 className='font-medium text-[40px]'>
          Профиль
        </h1>

        <div className='flex flex-col gap-[15px]'>
          <div
            className={cn(
              'w-full h-10.5 flex flex-row items-center',
              'rounded-[5px] bg-[#F5F5F5] border border-[#E8E8E8]',
            )}
          >
            <RadioGroup
              aria-label='Tab Bar'
              orientation='horizontal'
              value={currentTab}
              onValueChange={handleTabChange}
            >
              <CustomRadio
                label='Аккаунт'
                type='account'
                isSelected={currentTab === 'account'}
              />
              <CustomRadio
                label='Реферральная программа'
                type='referral'
                isSelected={currentTab === 'referral'}
              />
            </RadioGroup>
          </div>

          <div className='w-full flex flex-row gap-2.5'>
            <BorderedContainer className='flex-1'>
              <div
                className={cn(
                  'w-full h-full p-[18px]',
                  'flex flex-col gap-2.5',
                )}
              >
                <div className='flex justify-between'>
                  <h2 className='font-semibold leading-[23px] text-[20px]'>
                    Личная информация
                  </h2>

                  <div
                    className={cn(
                      'rounded-full flex items-center justify-center',
                      'bg-[#F6F1F1] text-[#797979] px-2.5 h-[30px]',
                    )}
                  >
                    Ваш ID: cmou7grus00013b6s2sr5acrg
                  </div>
                </div>
              </div>
            </BorderedContainer>

            <div
              className={cn(
                'rounded-[14px] bg-[#3BB240]/15 w-[315px] min-h-[597px]',
                'flex items-center justify-center',
              )}
            >
              <div
                className={cn(
                  'w-[249px] flex flex-col gap-2.5 items-center',
                )}
              >
                <span className='text-[16px] leading-[19px]'>
                  Ваш тарифный план
                </span>
                <span className='text-[36px] leading-[43px]'>
                  {plan.name}
                </span>
                <hr className='w-full border-[#C0C0C0]'/>
                {/* <span className='font-semibold text-[15px] leading-[18px]'>
                  Нет задолженности
                </span> */}
                <Button
                  className={cn(
                    'w-[190px] h-[35px] bg-transparent flex flex-row',
                    'leading-[19px] text-[16px] rounded-[5px]',
                  )}
                  onPress={handleChangePaymentPlan}
                >
                  <div className='size-[18px]'>
                    <SvgIcon src={addIcon} preserveOriginalColors/>
                  </div>
                  Изменить тариф
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default AccountPage
