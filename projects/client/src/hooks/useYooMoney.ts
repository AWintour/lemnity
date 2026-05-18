/* eslint-disable  @typescript-eslint/no-explicit-any */
// https://yookassa.ru/developers/payment-acceptance/integration-scenarios/widget/quick-start

import { useRef } from 'react'
import { useScript } from './useScript'
// import { nanoid } from '@reduxjs/toolkit'
import {
  createYooMoneyPayment,
  deletePayment,
  pollForPaymentUpdates,
  updateUserPaymentInfo,
  type TCreateYooMoneyPaymentArgs,
} from '@/services/payment'
import { useAppDispatch } from '@/stores/redux/hooks'
import { paymentIdChanged } from '@/stores/redux/paymentSlice'
import { addToast } from '@heroui/toast'

declare global {
  // i could try and implement a .d.ts file from the documentation
  // but it will probably break with their next update
  // and the problem will end up being virtually untraceable
  // so *any* it is
  // 
  // if they aren't providing the library as a package they should atleast
  // provide type definitions for it
  interface Window {
    YooMoneyCheckoutWidget: any
  }
}

const SCRIPT_URL = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js'

export const useYooMoney = () => {
  const status = useScript(SCRIPT_URL)
  const widget = useRef<any | null>(null)
  // const [idempotenceKey, setIdempotenceKey] = useState<string>()
  // const [confirmationToken, setConfirmationToken] = useState<string>()

  const dispatch = useAppDispatch()
  
  const launchWidget = async (args: TCreateYooMoneyPaymentArgs) => {
    if (status !== 'ready') {
      console.log('[YM] scipt is not yet loaded')
      return
    }

    if (widget.current) {
      widget.current.destoy()
      console.log('[YM] widget destroyed')
    }

    const { data } = await createYooMoneyPayment(args)
    console.log(data)

    if (!data.confirmation || !data.confirmation.confirmation_token) {
      return
    }

    const token: string = data.confirmation.confirmation_token
    const id: string = data.id

    dispatch(paymentIdChanged(id))

    widget.current = new window.YooMoneyCheckoutWidget({
      confirmation_token: token,
      customization: {
        colors: {
          control_primary: '#725DFF',
          control_primary_content: '#FFFFFF',
        },
        modal: true,
      },
      error_callback: (error: any) => {
        console.log(error)
      }
    })

    widget.current.on('modal_close', async () => {
      // toast
      console.log('[YM] modal_close')
      await pollForPaymentUpdates({
        paymentId: id,
        onSuccess:
          async (data) => {
            console.log(`[launchWidget] poll payment id={${id}} success`, data)
            addToast({
              title: 'Платёж успешно завершён',
              color: 'success',
            })
          },
        onCanceled:
          (data) => {
            console.log(`[launchWidget] poll payment id={${id}} canceled`, data)
            addToast({
              title: 'Платёж был отменён',
              color: 'warning',
            })
          },
      })()
    })

    widget.current.render()
  }

  return {
    status,
    launchWidget,
  }
}
