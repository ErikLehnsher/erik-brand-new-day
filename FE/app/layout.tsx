import "./globals.css";
import { Chrome } from "./chrome";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
