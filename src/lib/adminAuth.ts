import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export async function checkAdminAccess() {
  const session = await getCurrentUser();
  if (!session) {
    redirect('/login');
  }
  if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
    redirect('/');
  }
  return session;
}
