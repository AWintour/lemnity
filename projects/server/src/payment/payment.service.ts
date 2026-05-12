import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma.service'

import axios from 'axios'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { CreateYooMoneyPaymentDto } from './dto/createYooMoneyPayment.dto'
import { Decimal } from '@prisma/client-runtime-utils'

class CreateYooMoneyPaymentServiceArgs extends CreateYooMoneyPaymentDto {
  userId: string
}

class UpdateUSerPaymentInfoArgs {
  userId: string
  paymentPlanId: string
  optionsInCart: object
  billingPeriod: 'month' | 'quarter' | 'year'
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getUserPaymentInfo(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        paymentPlan: {
          include: {
            includedPlanOptions: true,
            paymentPlanOptions: true,
          }
        },
        purchasedPaymentPlanOptions: {
          include: {
            paymentPlanOption: true,
          }
        },
      }
    })

    return {
      balance: user.balance,
      paymentPlan: user.paymentPlan,
      paymentPlanStartDate: user.paymentPlanStartDate,
      paymentPlanEndDate: user.paymentPlanEndDate,
      purchasedPaymentPlanOptions: user.purchasedPaymentPlanOptions,
      usedTrialPeriod: user.usedTrialPeriod,
    }
  }


  selectAllEnabledPaymentPlans() {
    return this.prisma.paymentPlan.findMany({
      where: { enabled: true },
      include: {
        paymentPlanOptions: {
          where: { enabled: true },
        },
        includedPlanOptions: {
          where: { enabled: true },
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      }
    })
  }

  getPaymentPlanById(id: string) {
    return this.prisma.paymentPlan.findUnique({
      where: { id },
      include: {
        paymentPlanOptions: {
          where: { enabled: true },
        },
        includedPlanOptions: {
          where: { enabled: true },
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      }
    })
  }

  getPromo(promo: string) {
    return this.prisma.promo.findUnique({
      where: {
        promo: promo,
      },
    })
  }

  // i am learniing. i feel like "named" arrguments would be better here
  // but i do not know yet when to use them and when not to
  async createYooMoneyPayment (
    { total, description, userId, metadata }: CreateYooMoneyPaymentServiceArgs
  ) {
    const yooMoneyUsername =
      this.configService.get<string>('YOO_MONEY_STORE_ID')
    const yooMoneyPassword =
      this.configService.get<string>('YOO_MONEY_SECRET_KEY')
    
    if (!yooMoneyUsername || !yooMoneyPassword) {
      return
    }

    const { data } = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      {
        amount: {
          value: total,
          currency: 'RUB',
        },
        confirmation: {
          // payment with a widget (modal), not a form
          type: 'embedded',
        },
        // money will be taken from customer's account immediately
        capture: true,
        description: description,
        // not a subscription
        save_payment_method: false,
        // providing customer id signals to yookassa to save the payment method
        merchant_customer_id: userId,
        // custom data controllable by me >:3
        // will contain the user's order
        metadata,
      },
      {
        headers: {
          'Idempotence-Key': uuidv4(),
          'Content-Type': 'application/json',
        },
        auth: {
          username: yooMoneyUsername,
          password: yooMoneyPassword,
        },
      }
    )

    // save the payment data to the payments table
    await this.prisma.payment.create({
      data: {
        data,
        userId,
        id: data.id,
      },
    })

    return data
  }

  async checkForPaymentUpdates(paymentId: string, userId: string) {
    const yooMoneyUsername =
      this.configService.get<string>('YOO_MONEY_STORE_ID')
    const yooMoneyPassword =
      this.configService.get<string>('YOO_MONEY_SECRET_KEY')
    
    if (!yooMoneyUsername || !yooMoneyPassword) {
      return 404
    }

    const { data } = await axios.get(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        auth: {
          username: yooMoneyUsername,
          password: yooMoneyPassword,
        },
      }
    )

    if (data.status === 'canceled') {
      // await this.prisma.payment.deleteMany({
      //   where: {
      //     id: paymentId,
      //   }
      // })

      return data
    }

    await this.prisma.payment.upsert({
      where: { 
        id: paymentId,
      },
      update: { data },
      create: { data, userId, id: paymentId },
    })
        
    return data
  }

  async deletePayment(paymentId: string) {
    await this.prisma.payment.delete({
      where: {
        id: paymentId,
      }
    })

    return
  }

  async getTodaysPendingPayments(userId: string) {
    const now = DateTime.now()
    const lastDay = now.minus({ days: 1 }).toJSDate()

    const result = this.prisma.payment.findMany({
      where: {
        createdAt: {
          gt: lastDay,
        },
        // i will eddit the payments schema to store the payment status
        // as a separate field in the database so that it will be queried
        // without needing to parse the json
        data: {
          path: ['status'],
          equals: 'pending',
        },
        userId,
      },
    })

    return result
  }


  getMonthsFromABillingPeriod(billingPeriod: 'month' | 'quarter' | 'year') {
    switch (billingPeriod) {
      case 'month':
        return 1
      case 'quarter':
        return 3
      case 'year':
        return 12
    }
  }

  // how do i even begin to simplify this?
  // i need the payment process to be secure so the client should have
  // the least authority, right? otherwise it would be prudent to just
  // send the server all this data i query from the database
  // in a nice cute chunk and call it a day
  // literrally nothing is stopping me frrom stealing the auth cookie and
  // sending the request myself giving me an arbitrary plan or amount of moneys
  // i am probably both stupid *and* overthinking *and* this is flawed anyway
  // whoever needs to deal with this next i am sorry =w=
  async updateUserPaymentInfo(
    {
      userId,
      billingPeriod,
      optionsInCart,
      paymentPlanId,
    }: UpdateUSerPaymentInfoArgs
  ) {
    // this should be a transaction
    const months = this.getMonthsFromABillingPeriod(billingPeriod)
    const selectedOptionsInCart =
      Object.keys(optionsInCart).reduce((acc: string[], key) => {
        if (optionsInCart[key]) {
          acc.push(key)
        }
        return acc
      }, [])
    
    // there's literally 2 of them at the moment
    let options = await this.prisma.paymentPlanOptions.findMany()

    options = options.filter((option) => {
      return selectedOptionsInCart.includes(option.type)
    })

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        purchasedPaymentPlanOptions: true,
      },
    })

    const paymentPlan = await this.prisma.paymentPlan.findUnique({
      where: { id: paymentPlanId },
    })

    if (!user || !paymentPlan) {
      return
    }
    
    // this looks hella bad but there should be at most 3 options selected?
    // maybe 4?
    // considerinng that not everyone will be constantly spamming payments
    // this should be barely noticeable in terms of performance
    options.forEach(async (option) => {
      // check if the option was already purchased (and is still valid)
      // and update the expiration date
      const alreadyPurchasedOption = user.purchasedPaymentPlanOptions.find(
        (purchasedOption) =>
          purchasedOption.paymentPlanOptionId === option.id
          && DateTime.fromJSDate(purchasedOption.expiresAt) > DateTime.now()
      )

      if (alreadyPurchasedOption) {
        await this.prisma.purchasedPaymentPlanOption.update({
          where: { id: alreadyPurchasedOption.id },
          data: {
            expiresAt: DateTime.fromJSDate(alreadyPurchasedOption.expiresAt)
              .plus({ months: option.isBilledAnnually ? 12 : months })
              .toJSDate(),
          },
        })

        return
      }

      // this option was either not purchased or expired so create a new one
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          purchasedPaymentPlanOptions: {
            create: {
              paymentPlanOptionId: option.id,
              purchasedAt: new Date(),
              expiresAt: DateTime.now()
                .plus({ months: option.isBilledAnnually ? 12 : months })
                .toJSDate(),
            },
          },
          updatedAt: new Date(),
        },
      })
    })

    // this is hell
    const balance = new Decimal(user.balance)
    let total = new Decimal('0')

    switch (billingPeriod) {
      case 'month':
        const monthlyPrice = new Decimal(paymentPlan.monthlyPrice)
        total = monthlyPrice
        break
      case 'quarter':
        const quarterlyPrice = new Decimal(paymentPlan.quarterlyPrice)
        total = quarterlyPrice
        break
      case 'year':
        const yearlyPrice = new Decimal(paymentPlan.yearlyPrice)
        total = yearlyPrice
        break
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        paymentPlanId,
        paymentPlanStartDate: new Date(),
        paymentPlanEndDate: billingPeriod
          ? DateTime
              .now()
              .plus({
                [
                  billingPeriod === 'month'
                    ? 'months'
                    : billingPeriod === 'quarter'
                      ? 'quarters'
                      : 'years'
                ]: 1
              })
              .toJSDate()
          : undefined,
        usedTrialPeriod: true,
        updatedAt: new Date(),
        balance: balance.plus(total).toFixed(2),
      }
    })
  }
}
