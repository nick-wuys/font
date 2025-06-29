export const Footer = () => {
    return (
        <footer className="p-4">
            <div className="container mx-auto text-center">
                <p>
                    &copy; {new Date().getFullYear()} My Blog. All rights
                    reserved.
                </p>
                <p>
                    Built with{" "}
                    <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        Next.js
                    </a>
                </p>
            </div>
        </footer>
    );
};
