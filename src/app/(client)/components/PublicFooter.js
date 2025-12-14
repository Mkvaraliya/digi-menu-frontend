// src/app/(client)/components/PublicFooter.js
import Link from "next/link";

const PublicFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-md md:max-w-xl lg:max-w-3xl px-4 py-2 text-center text-[11px] text-muted-foreground">
        <span>Powered by </span>
        <Link
          href="https://sidratech.in"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Sidratech Softwares
        </Link>
      </div>
    </footer>
  );
};

export default PublicFooter;
