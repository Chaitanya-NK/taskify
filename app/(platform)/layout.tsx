import { ClerkProvider } from "@clerk/nextjs";

const PlatformLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <>
            {children}
        </>
    )
}

export default PlatformLayout;