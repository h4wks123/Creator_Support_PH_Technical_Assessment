import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="w-full h-dvh bg-background">
      <Image
        src="/bezier_curve_2.svg"
        alt="bezier_curve_2"
        width={0}
        height={0}
        style={{
          position: "fixed",
          width: "28%",
          minWidth: "325px",
          height: "auto%",
        }}
      />
      <Image
        src="/bezier_curve_1.svg"
        alt="bezier_curve_1"
        width={0}
        height={0}
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "28%",
          minWidth: "325px",
          height: "auto%",
        }}
      />
      {children}
    </section>
  );
}
