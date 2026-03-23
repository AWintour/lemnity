/* eslint-disable  @typescript-eslint/no-explicit-any */
// https://developers.cloudpayments.ru/#platezhnyy-vidzhet

import { useEffect, useRef } from 'react'
import { useScript } from './useScript'

declare global {
  // i could try and implement a .d.ts file from the documentation
  // but it will probably break with their next update
  // and the problem will end up being virtually untraceable
  // so *any* it is
  // 
  // if they aren't providing the library as a package they should atleast
  // provide type definitions for it
  const cp: any
}

const SCRIPT_URL = 'https://widget.cloudpayments.ru/bundles/cloudpayments.js'

export const useCloudPayments = (callback: (result: any) => void) => {
  const status = useScript(SCRIPT_URL)
  const widget = useRef<any | null>(null)

  // name taken directly from CP docs
  const paymentOptions = {
    publicTerminalId: 'test_api_00000000000000000000002',
    amount: 123000,
    currency: 'RUB',
    description: 'Оплата товаров в example.com',
    externalId: 424242,
    paymentSchema: 'Single',
    restrictedPaymentMethods: ['TcsInstallment', 'Dolyame'],
  }

  const launchWidget = () => {
    if (!widget.current) {
      return
    }

    widget.current.oncomplete = callback

    widget.current
      .start(paymentOptions)
      .then((result: any) => {
        console.log('promise result:', result)
      })
  }

  useEffect(() => {
    if (status !== 'ready' || widget.current !== null) {
      return
    }

    widget.current = new cp.CloudPayments()
    
    console.log('widget.current', widget.current)
    console.log('pay', widget.current.pay)
    console.log('import.meta.env:', import.meta.env)
    console.log(
      'VITE_CLOUDPAYMENTS_PUBLIC_ID:',
      import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID
    )
  }, [status])

  return {
    status,
    widget,
    launchWidget,
  }
}
