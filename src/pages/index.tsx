import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Timeline from "~/components/Timeline";

const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session?.user ? (
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
        >
          Log Out
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            void signIn();
          }}
        >
          Log In
        </button>
      )}
      <Timeline where={{}} />
    </>
  );
};

export default Home;