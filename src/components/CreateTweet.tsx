import { type FormEvent, useState } from "react";
import { object, string } from "zod";
import { api } from "~/utils/api";

export const tweetSchema = object({
  text: string({
    required_error: "Tweet text is required",
  })
    .min(10)
    .max(200),
});

export default function CreateTweet() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const utils = api.useContext();
  
  const { mutateAsync } = api.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      void utils.tweet.timeline.invalidate();
    }
  });


  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      tweetSchema.parse({ text });
    } catch (err) {
      setError(err.message);
      return;
    }
    void mutateAsync({ text });
  }

  return (
    <>
      {error && JSON.stringify(error)}
      <form
        onSubmit={handleSubmit}
        className="mb-4 flex w-full flex-col rounded-md border-2 p-4"
      >
        <label htmlFor="text" aria-label="text"></label>
        <textarea
          id="text"
          onChange={(e) => setText(e.currentTarget.value)}
          className="w-full p-4 shadow"
        ></textarea>
        <button
          type="submit"
          className="bg-primary mt-4 place-self-end rounded-md px-4 py-2 text-white"
        >
          Tweet
        </button>
      </form>
    </>
  );
}
