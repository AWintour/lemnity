import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  getUserBalanceAndPaymentPlan(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        balance: true,
        paymentPlan: {
          select: {
            id: true,
            name: true,
            enabled: true,
            numberOfProjects: true,
            numberOfWidgets: true,
            monthlyPrice: true,
            quarterlyPrice: true,
            yearlyPrice: true,
            brandingPrice: true,
            options: true,
          }
        },
      },
    })
  }

  updateUserPaymentPlanAndBalance(
    userId: string,
    balance?: number,
    planId?: string
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        balance,
        paymentPlanId: planId,
      }
    })
  }
}