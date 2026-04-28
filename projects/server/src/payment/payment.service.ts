import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  getUserPaymentInfo(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        balance: true,
        paymentPlan: true,
        paymentPlanStartDate: true,
        paymentPlanEndDate: true,
        purchasedPaymentPlanOptions: true,
        usedTrialPeriod: true,
      },
    })
  }

  // updateUserPaymentPlanAndBalance(
  //   userId: string,
  //   balance?: number,
  //   planId?: string
  // ) {
  //   return this.prisma.user.update({
  //     where: { id: userId },
  //     data: {
  //       balance,
  //       paymentPlanId: planId,
  //     }
  //   })
  // }

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
}