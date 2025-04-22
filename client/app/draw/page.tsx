import { Metadata } from "next";
import Draw from "./Draw";
export const metadata: Metadata = {
  title: "🎨 Multiplayer Draw App",
  description:
    "Unleash your creativity together! Collaborate or compete in real-time as you and your friends draw on a shared canvas. Whether you're sketching masterpieces, playing drawing games, or just doodling for fun—this is the perfect space for artistic chaos and laughs. Instant updates, smooth interaction, endless possibilities!",
};
const page = () => {
  return (
    <>
      <Draw />
    </>
  );
};

export default page;
