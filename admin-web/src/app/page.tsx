import { redirect } from 'next/navigation';

export default function Home() {
  // Autoredirect to login
  redirect('/login');
}
