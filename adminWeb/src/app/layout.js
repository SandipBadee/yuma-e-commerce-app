import './globals.css';
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: 'YUMA Ecommerce',
  description: 'YUMA Ecommerce online grocery store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}