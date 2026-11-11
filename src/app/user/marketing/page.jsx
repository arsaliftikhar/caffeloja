import { redirect } from 'next/navigation';

export default function UserMarketingRedirect() {
  redirect('/user/dashboard');
}
