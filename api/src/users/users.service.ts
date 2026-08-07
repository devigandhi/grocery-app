import { Injectable } from '@nestjs/common';
import { rethrowAuthError } from '../auth/auth-error.util';
import { AuthService } from '../auth/auth.service';
import { syntheticEmailForPhone } from '../auth/phone.util';
import { Paginated } from '../common/paginated.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  name: true,
  phoneNumber: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type UserSummary = Prisma.UserGetPayload<{ select: typeof userSelect }>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateUserDto, headers: Headers): Promise<UserSummary> {
    let userId: string;
    try {
      const created = await this.authService.auth.api.signUpEmail({
        body: {
          email: syntheticEmailForPhone(dto.phoneNumber),
          password: dto.password,
          name: dto.name,
          phoneNumber: dto.phoneNumber,
        },
        headers,
      });
      userId = created.user.id;
    } catch (err) {
      rethrowAuthError(err);
    }

    if (dto.role === Role.ADMIN) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: Role.ADMIN },
      });
    }

    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: userSelect,
    });
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<UserSummary>> {
    const { page, pageSize } = query;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, pageSize };
  }

  findOne(id: string): Promise<UserSummary> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: userSelect,
    });
  }

  update(id: string, dto: UpdateUserDto): Promise<UserSummary> {
    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.phoneNumber !== undefined) {
      data.phoneNumber = dto.phoneNumber;
      // keep the Better Auth login identity in sync with the phone number
      data.email = syntheticEmailForPhone(dto.phoneNumber);
    }
    return this.prisma.user.update({ where: { id }, data, select: userSelect });
  }

  async remove(id: string): Promise<void> {
    // Session/Account rows cascade-delete via the schema's onDelete: Cascade.
    await this.prisma.user.delete({ where: { id } });
  }

  search(q: string): Promise<UserSummary[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phoneNumber: { contains: q } },
        ],
      },
      take: 10,
      select: userSelect,
    });
  }
}
