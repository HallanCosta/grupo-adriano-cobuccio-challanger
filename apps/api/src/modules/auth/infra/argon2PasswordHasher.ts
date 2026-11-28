import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { PasswordHasher } from '../domain/ports/passwordHasher.js';

/** argon2id with the library defaults (64 MiB, 3 iterations). */
@Injectable()
export class Argon2PasswordHasher extends PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return argon2.hash(plainPassword, { type: argon2.argon2id });
  }

  verify(hash: string, plainPassword: string): Promise<boolean> {
    return argon2.verify(hash, plainPassword);
  }
}
