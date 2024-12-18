import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner"

const PlatformLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <>
            <QueryProvider>
                <Toaster />
                <ModalProvider />
                {children}
            </QueryProvider>
        </>
    )
}

export default PlatformLayout;