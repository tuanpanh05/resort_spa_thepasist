import React from "react";
import Hero from "../components/Hero";
import OurPhilosophy from "../components/OurPhilosophy";
import WellnessExperiences from "../components/WellnessExperiences";
import Rooms from "../components/Rooms";
import ADayAtNguSon from "../components/ADayAtNguSon";
import GuestStories from "../components/GuestStories";
import BookingForm from "../components/BookingForm";

export default function Home() {
  return (
    <>
      <Hero />
      <OurPhilosophy />
      <WellnessExperiences />
      <Rooms />
      <ADayAtNguSon />
      <GuestStories />
      <BookingForm />
    </>
  );
}
