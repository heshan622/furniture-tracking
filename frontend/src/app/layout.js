import "./globals.css";

export const metadata = {
  title: "Furniture Logistics Tracking System",
  description: "AICONIQ GPS Auditing Command Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* This forces Tailwind CSS to load immediately, bypassing local config bugs */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-slate-100">{children}</body>
    </html>
  );
}
