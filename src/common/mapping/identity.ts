import type { User, UserRole, UserStatus } from '../models/user';
import type { AuthAccountDto, MeResponseDto } from '../models/identity';

export function normalizeRole(code: string): UserRole {
  return code === 'ADMIN' ? 'admin' : 'user';
}

export function normalizeStatus(status: string): UserStatus {
  const value = status.toUpperCase();
  if (value === 'SUSPENDED') return 'suspended';
  if (value === 'INACTIVE') return 'inactive';
  return 'active';
}

export function mapAuthAccountToUser(account: AuthAccountDto): User {
  return {
    id: account.id,
    email: account.email,
    displayName: account.email.split('@')[0],
    role: normalizeRole(account.role),
    status: normalizeStatus(account.status),
  };
}

export function mapMeToUser(me: MeResponseDto): User {
  return {
    id: me.id,
    email: me.email,
    displayName: me.name || me.email.split('@')[0],
    role: me.role ? normalizeRole(me.role.code) : 'user',
    status: normalizeStatus(me.status),
  };
}
