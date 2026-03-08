import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-xl border border-gray-100 rounded-2xl",
                            headerTitle: "text-gray-900",
                            headerSubtitle: "text-gray-500",
                            socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 transition-colors",
                            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                            footerActionLink: "text-blue-600 hover:text-blue-700",
                        }
                    }}
                />
            </div>
        </div>
    );
}
