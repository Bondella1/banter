import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AxiosProvider } from './providers/axios';

export const metadata = {
  title: 'Bant3r',
  description: 'Buy. Sell. Banter.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AxiosProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AxiosProvider>
      </body>
    </html>
  );
}
