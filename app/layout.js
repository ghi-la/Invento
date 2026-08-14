import Providers from "./providers";

export const metadata = {
  title: "Warehouse Inventory",
  description: "Track stock across multiple warehouses, on any device.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E2530",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
