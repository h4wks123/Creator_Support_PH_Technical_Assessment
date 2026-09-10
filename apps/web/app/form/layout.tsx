import NavBar from "@/components/nav-bar";

export default function FormLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><NavBar />{children}</>;
}
