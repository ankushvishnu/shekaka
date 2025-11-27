import "./globals.css";

export const metadata = {
  title: "Shekaka",
  description: "AI-powered Setswana ↔ English learning & translation"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="app-shell">
          <div className="container">{children}</div>
        </div>
      </body>
    </html>
  );
}
