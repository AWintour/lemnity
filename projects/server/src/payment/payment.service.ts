import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

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
}