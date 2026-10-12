import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export const metadata = {
  title: "Frontend",
  description: "Shop website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
