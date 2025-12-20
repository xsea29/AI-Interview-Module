import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AI Interview Platform",
  description: "AI-powered interview system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
