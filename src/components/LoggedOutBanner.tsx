import { signIn, useSession } from "next-auth/react";
import Container from "./Container";

export default function LoggedOutBanner() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="fixed bottom-0 w-full bg-primary p-4 text-white">
        <Container className="flex justify-between bg-transparent items-center">
          <p>Don&apos;t miss what&apos;s happening!</p>
          <button type="button" onClick={() => void signIn()} className="shadow-md px-4 py-2 bg-white/80 text-primary rounded-lg">
            Sign In
          </button>
        </Container>
      </div>
    );
  }
  return null;
}
