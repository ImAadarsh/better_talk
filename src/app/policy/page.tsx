import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function PolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-3xl font-bold mb-8">Cancellation & Refund Policy</h1>

                <div className="prose prose-blue max-w-none text-gray-700">
                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Cancellation Policy</h2>
                    <p>Once a therapy session is bought on BetterTalk, it cannot be cancelled or rescheduled. If you are unable to attend the scheduled session due to any reason, the session will still be considered as completed and no refund will be provided.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Refund Policy</h2>
                    <p>At BetterTalk, we have a no-refund policy for all therapy sessions purchased through our app. We do not provide refunds for any reason, including but not limited to, dissatisfaction with the therapy session, change in mind, or inability to attend the scheduled session.</p>

                    <p className="mt-4">However, if there is any technical issue or connectivity problem that prevents you from having a successful therapy session, we may offer to schedule another therapy session with the same therapist based on their availability.</p>

                    <p className="mt-4">Please note that the availability of the therapist for the rescheduled session is not guaranteed and depends on their schedule. We will do our best to accommodate your request for a rescheduled session but cannot guarantee the same therapist or the same time slot.</p>

                    <p className="mt-4">We appreciate your understanding and cooperation regarding our cancellation and refund policy.</p>

                    <hr className="my-8 border-gray-200" />

                    <p>If you have any questions or concerns, please feel free to reach out to our customer support team at <a href="mailto:support@bettertalk.com" className="text-blue-600 hover:underline">support@bettertalk.com</a>.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
