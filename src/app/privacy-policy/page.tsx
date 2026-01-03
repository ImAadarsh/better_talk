import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <PublicNavbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-blue max-w-none text-gray-700">
                    <p className="font-medium text-lg mb-6">Betalk Consultants Private Limited takes the privacy and security of our users&apos; personal information very seriously. This Privacy Policy outlines how we collect, use, and protect the personal information of our users. By using our app, BetterTalk, you agree to the terms of this Privacy Policy.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Information We Collect From our app BetterTalk</h2>
                    <p>We collect personal information from our users when they sign up for our services, including their name, email address, date of birth, and payment information. We also collect information related to their therapy sessions, including the timing of the sessions, duration and all other communications are not saved by us.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">How We Use Your Information</h2>
                    <p>We use your personal information to provide our services, including scheduling and conducting therapy sessions, billing, and customer support. We may also use your information to improve our services, personalize your experience, and send you relevant marketing communications.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">How We Protect Your Information</h2>
                    <p>We take appropriate measures to protect your personal information from unauthorized access, disclosure, or destruction. We use industry-standard security measures, such as encryption and secure servers, to safeguard your personal information.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Third-Party Services</h2>
                    <p>We may use third-party services, such as payment processors and analytics tools, to provide and improve our services. These third-party services may have access to your personal information, but they are required to protect your information and use it only for the purpose of providing the requested service.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Sharing Your Information</h2>
                    <p>We may share your personal information with authorized personnel, including therapists and support staff, to provide our services. We may also share your information with law enforcement agencies or government authorities when required by law or to protect our rights and property.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Your Rights</h2>
                    <p>You have the right to access, update, and delete your personal information at any time. You can also opt out of receiving marketing communications from us.</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-900">Changes to This Privacy Policy</h2>
                    <p>We reserve the right to update or modify this Privacy Policy at any time. We will notify you of any changes by posting the updated policy on our website or by sending you a notification. This privacy policy is set in place since 1/03/2023.</p>

                    <hr className="my-8 border-gray-200" />

                    <p>If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:support@bettertalk.com" className="text-blue-600 hover:underline">support@bettertalk.com</a>.</p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
