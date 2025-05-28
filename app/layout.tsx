import './globals.css';
import TopBar from './components/TopBar';

export const metadata = {
  title: 'FindEVCharger.ca',
  description: 'Live Canadian EV-charger map'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: '100%' }}>
        <TopBar />
        {children}
      </body>
    </html>
  );
}

