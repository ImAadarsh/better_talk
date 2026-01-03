import CommunityGroupsList from "@/components/CommunityGroupsList";
import DashboardLayout from "@/components/DashboardLayout";

export default function GroupsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Communities</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Find your safe space to share and grow.</p>
                </div>

                <CommunityGroupsList />
            </div>
        </DashboardLayout>
    );
}
