import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api, RouterInputs, type RouterOutputs } from "~/utils/api";
import CreateTweet from "./CreateTweet";
import { AiFillHeart } from "react-icons/ai";
import {
  type InfiniteData,
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dh",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const LIMIT = 10;

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const windowScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (windowScroll / height) * 100;

    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
}

interface UpdateCacheProps {
  client: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
  input: RouterInputs["tweet"]["timeline"];
}

function updateCache({
  client,
  variables,
  data,
  action,
  input,
}: UpdateCacheProps) {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const value = action === "like" ? 1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }
            return tweet;
          }),
        };
      });
      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}

function Tweet({
  tweet,
  client,
  input,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
}) {
  const likeMutation = api.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "like", input });
    },
  }).mutateAsync;
  const unlikeMutation = api.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "unlike", input });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;

  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt=""
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center">
            <Link
              className="font-bold"
              href={`/${tweet.author.name ? tweet.author.name : ""}`}
            >
              {tweet.author.name}
            </Link>
            <p className="text-sm text-gray-400">
              {" "}
              - {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>{tweet.text}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          size="1.5rem"
          color={hasLiked ? "red" : "gray"}
          onClick={() => {
            if (hasLiked) {
              return void unlikeMutation({ tweetId: tweet.id });
            }
            return void likeMutation({ tweetId: tweet.id });
          }}
        />
        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
      </div>
    </div>
  );
}

export default function Timeline({
  where = {},
}: {
  where: RouterInputs["tweet"]["timeline"]["where"];
}) {
  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      {
        limit: LIMIT,
        where,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const client = useQueryClient();

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];
  return (
    <div>
      <CreateTweet />
      <div className="border-x-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            input={{ where, limit: LIMIT }}
          />
        ))}
        {!hasNextPage && <p>No more items to load</p>}
      </div>
    </div>
  );
}
