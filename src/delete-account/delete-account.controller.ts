import {
  Body,
  Controller,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DeleteAccountService } from './delete-account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

@Controller('delete-account')
export class DeleteAccountController {
  constructor(private readonly deleteAccountService: DeleteAccountService) {}

  @UseGuards(JwtAuthGuard)
  @Delete()
  // eslint-disable-next-line @typescript-eslint/require-await
  async deleteMyAccount(@Req() req: any, @Body() body: DeleteAccountBody) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req?.user?.id;

    if (!userId) {
      throw new BadRequestException('Kullanıcı bilgisi bulunamadı');
    }

    if (!body?.reason) {
      throw new BadRequestException('Silme nedeni zorunludur');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.deleteAccountService.deleteMyAccount(userId, body);
  }
}
