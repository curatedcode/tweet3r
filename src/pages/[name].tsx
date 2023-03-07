import { NextPage } from "next";
import { useRouter } from "next/router";
import Timeline from "~/components/Timeline";

const UserPage : NextPage = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <div>
      <Timeline where={{
        author: {
          name,
        }
      }} />
    </div>
  )
}

export default UserPage