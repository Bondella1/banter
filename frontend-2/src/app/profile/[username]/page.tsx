// src/app/profile/[username]/page.tsx
import UserProfile from "./UserProfileClient";

type PageProps = {
  // Next.js now gives you `params` as a Promise
  params: Promise<{ username: string }>;
};

export default async function Page({ params }: PageProps) {
  // await the params before using them
  const { username } = await params;

  return <UserProfile username={username} />;
}
