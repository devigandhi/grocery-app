import { IsEnum, IsString } from 'class-validator';
import { ShareChannel } from '../../../generated/prisma/enums';

export class CreateShareDto {
  @IsString()
  shoppingListId!: string;

  @IsString()
  sharedWithUserId!: string;

  @IsEnum(ShareChannel)
  channel!: ShareChannel;
}
