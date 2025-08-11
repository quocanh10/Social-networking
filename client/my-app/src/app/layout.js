import { Roboto } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import "@uploadthing/react/styles.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "InstaReflection",
  description: "Nơi bạn có thể chia sẻ mọi khoảnh khắc của mình với mọi người.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
