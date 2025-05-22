import { redirect } from 'next/navigation';

export default function RootPage() {
  // Immediately redirect to the login page
  redirect('/login');

  // Note: This component will likely not render anything visible
  // as the redirect happens server-side before rendering.
  // You could optionally return null or a loading indicator,
  // but redirect() should handle it.
  // return null; 
}
