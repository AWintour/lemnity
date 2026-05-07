import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma.service'

import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { CreateYooMoneyPaymentDto } from './dto/createYooMoneyPayment.dto'

class CreateYooMoneyPaymentServiceArgs extends CreateYooMoneyPaymentDto {
  userId: string
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
        purchasedPaymentPlanOptions: true,
      }
    })

    return {
      balance: user.balance,
      paymentPlan: user.paymentPlan,
      paymentPlanStartDate: user.paymentPlanStartDate,
      paymentPlanEndDate: user.paymentPlanEndDate,
      purchasedPaymentPlanOptions: user.purchasedPaymentPlanOptions.map(
        (value) => ({
          id: value.id,
          name: value.name,
          type: value.type,
        })
      ),
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

  getPromo(promo: string) {
    return this.prisma.promo.findUnique({
      where: {
        promo: promo,
      },
    })
  }

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

    const result = { status: data.status }

    if (data.status === 'canceled') {
      await this.prisma.payment.deleteMany({
        where: {
          id: paymentId,
        }
      })

      return result
    }

    await this.prisma.payment.upsert({
      where: { 
        id: paymentId,
      },
      update: { data },
      create: { data, userId, id: paymentId },
    })
        
    return result
  }
}
