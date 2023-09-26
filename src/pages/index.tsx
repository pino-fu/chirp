import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingAnimation } from "~/components/loadingAnimation";

dayjs.extend(relativetime);

// CREATES POSTS
const CreatePostWizard = () => {
  const { user } = useUser();

  console.log(user);

  if (!user) return null;

  return (
    <div className="flex gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

// INITIALIZES NEW TYPE 
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

// EACH POST WILL BE CREATED WITH THIS FUNCION IN A .MAP()
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image src={author.profilePicture} 
        className="h-14 w-14 rounded-full" 
        alt="{`@{author.username}'s profile picture"
        height={56}
        width={56}
        />
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

// LOOP THROUGH ALL POSTS USING POSTVIEW FUNCTION ABOVE
const Feed = () => {
  const { data, isLoading: postsLoaded } = api.posts.getAll.useQuery();

if (postsLoaded) return <LoadingAnimation />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
  )
}

// NOW PUT IT ALL TOGETHER AND PARTY 
const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return  <div />;

  //if (!data) return (<div>Something went wrong</div>);

  return (
    <>
      <main className="flex h-screen justify-center">
        <div className="md:mad-w-2xl h-full w-full  border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!isSignedIn && (
              <div className="flex justify-center">
                <CreatePostWizard />
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};
export default Home;
