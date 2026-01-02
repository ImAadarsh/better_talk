import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Admin Dashboard | BetterTalk",
    description: "Manage users, therapists, and platform settings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}
