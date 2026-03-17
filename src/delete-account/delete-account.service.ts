import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type DeleteReason =
  | 'NOT_USEFUL'
  | 'TOO_MANY_NOTIFICATIONS'
  | 'PRIVACY_CONCERNS'
  | 'TECHNICAL_ISSUES'
  | 'FOUND_ALTERNATIVE'
  | 'OTHER';

type DeleteAccountBody = {
  reason: DeleteReason;
  note?: string;
};

@Injectable()
export class DeleteAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteMyAccount(userId: number, body: DeleteAccountBody) {
    if (!body?.reason) {
      throw new BadRequestException('Silme nedeni zorunludur');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.prisma.$transaction(async (tx) => {
      /**
       * 1) NotificationFeedback
       * Bazı yapılarda userNotification üzerinden bağlı olabilir.
       * Önce user’ın userNotification kayıtlarını bulup ona bağlı feedbackleri siliyoruz.
       */
      const userNotifications = await tx.userNotification.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const userNotificationIds = userNotifications.map((x) => x.id);

      if (userNotificationIds.length > 0) {
        await tx.notificationFeedback.deleteMany({
          where: {
            OR: [
              { userId: user.id },
              { userNotificationId: { in: userNotificationIds } },
            ],
          },
        });
      } else {
        await tx.notificationFeedback.deleteMany({
          where: { userId: user.id },
        });
      }

      /**
       * 2) Feedback
       */
      await tx.feedback.deleteMany({
        where: { userId: user.id },
      });

      /**
       * 3) SurveyAnswer
       * SurveyResponse -> SurveyAnswer ilişkisi varsa önce answers silinmeli
       */
      const surveyResponses = await tx.surveyResponse.findMany({
        where: { userId: user.id },
        select: { id: true },
      });

      const surveyResponseIds = surveyResponses.map((x) => x.id);

      if (surveyResponseIds.length > 0) {
        await tx.surveyAnswer.deleteMany({
          where: {
            responseId: { in: surveyResponseIds },
          },
        });
      }

      /**
       * 4) SurveyResponse
       */
      await tx.surveyResponse.deleteMany({
        where: { userId: user.id },
      });

      /**
       * 5) UserNotification
       */
      await tx.userNotification.deleteMany({
        where: { userId: user.id },
      });

      /**
       * 6) User deviceId temizliği opsiyonel
       * User silmeden önce null'lamak şart değil ama güvenli.
       */
      await tx.user.update({
        where: { id: user.id },
        data: {
          deviceId: null,
        },
      });

      /**
       * 7) Son olarak user sil
       */
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return {
      success: true,
      message: 'Hesap başarıyla silindi',
      reason: body.reason,
      note: body.note?.trim() || null,
    };
  }
}
