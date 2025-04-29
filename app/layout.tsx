

import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Head from "next/head";

export const metadata = {
  title: 'TravelerConnect | Explore with Experts',
  description: 'Best travel guide booking app.',
  icons: {
    icon: '/home.png',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <Head>
        <link rel="icon" href="/logo1.png" type="image/png" />
      </Head>
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          <NotificationProvider>

          {children}
          </NotificationProvider>
          </AuthProvider> 
         
      </body>
    </html>
  );
}
