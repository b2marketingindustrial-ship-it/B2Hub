import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "B2 Hub",
  description: "Painel moderno para organizacao de tarefas e operacao do time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body
        className="
          min-h-screen
          bg-background
          text-foreground
        "
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
