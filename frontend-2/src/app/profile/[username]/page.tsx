import UserProfile from "./UserProfileClient";

type PageProps = {
  params: {
    username: string;
  };
};

export default function Page({ params }: PageProps) {
  return <UserProfile username={params.username}/>;
}