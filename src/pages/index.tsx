import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";

dayjs.extend(relativetime);

const CreatePostWizard = () => {
  const { user } = useUser();

  console.log(user);

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <img
        src={user.imageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <img src={author.profilePicture} className="h-14 w-14 rounded-full" />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <span>{`@${author.username!}`}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  //if (!data) return (<div>Something went wrong</div>);

  return (
    <>
      <main className="flex h-screen justify-center">
        <div className="md:mad-w-2xl h-full w-full  border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!user.isSignedIn && (
              <div className="flex justify-center">
                <CreatePostWizard />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};
export default Home;
