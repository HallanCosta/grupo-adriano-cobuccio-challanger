import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { eq } from 'drizzle-orm';
import type { Database } from '@/shared/infra/database/database.js';
import { users } from '@/shared/infra/database/schema.js';
import { UserFinder } from '@/modules/auth/domain/ports/userFinder.js';
import type { User } from '@/modules/auth/domain/user.js';

@Injectable()
export class DrizzleUserFinder extends UserFinder {
  constructor(@InjectDrizzle() private readonly db: Database) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user ?? null;
  }
}
