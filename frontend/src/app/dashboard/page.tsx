"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUserStore } from "@/store";

export default function Dashboard() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("id");
  const accessToken = searchParams.get("accesstoken");
  const isfirstLogin = searchParams.get("firstlogin");

  const fetchCurrentUser = useUserStore((state) => state.getUser);


  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    if (userId && isfirstLogin === "true") {
      window.location.href = `/profile/${userId}`;
    }
  }, []);

   useEffect(() => {
    console.log("useffect dashboard render....");
      fetchCurrentUser();
  }, []);

  if (userId && isfirstLogin === "true") {
    return <div>Redirecting...</div>;
  }
  return (
    <div>
      <div className="bg-[#3f3cbb] min-h-screen flex flex-col items-center justify-center text-white p-8">
  <div className="grid grid-cols-3 gap-8 max-w-6xl">
    <div className="bg-[#5e5ce6] rounded-lg overflow-hidden shadow-lg">
      <img
        src="/placeholder.svg"
        alt="AI Opponent"
        className="w-full h-40 object-cover"
        width="400"
        height="200"
        // style="aspect-ratio: 400 / 200; object-fit: cover;"
      />
      <div className="p-4">
        <h2 className="text-2xl font-bold">FACE OUR AI OPPONENT!</h2>
        <p className="mt-2">Challenge our AI opponent and test your ping pong skills</p>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 bg-[#312e81]">
          Play
        </button>
      </div>
    </div>
    <div className="bg-[#5e5ce6] rounded-lg overflow-hidden shadow-lg">
      <img
        src="/placeholder.svg"
        alt="Challenge a Friend"
        className="w-full h-40 object-cover"
        width="400"
        height="200"
        // style="aspect-ratio: 400 / 200; object-fit: cover;"
      />
      <div className="p-4">
        <h2 className="text-2xl font-bold">CHALLENGE A FRIEND!</h2>
        <p className="mt-2">Play against a friend in a thrilling 1vs1 ping pong match.</p>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4 bg-[#312e81]">
          Play
        </button>
      </div>
    </div>
    <div className="bg-[#5e5ce6] rounded-lg overflow-hidden shadow-lg">
      <div className="p-4">
        <h2 className="text-2xl font-bold">FRIENDS</h2>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Spaghetti</span>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#312e81]">
              Invite
            </button>
          </div>
          <div className="flex justify-between">
            <span>Wackadoodle</span>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#312e81]">
              Invite
            </button>
          </div>
          <div className="flex justify-between">
            <span>Bytes</span>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#312e81]">
              Invite
            </button>
          </div>
          <div className="flex justify-between">
            <span>Spencer00</span>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-[#312e81]">
              Invite
            </button>
          </div>
        </div>
        <div className="mt-4 bg-[#312e81] rounded-lg p-4">
          <h3 className="text-lg font-semibold">LEADERBOARD</h3>
        </div>
        <div className="mt-4 bg-[#312e81] rounded-lg p-4">
          <h3 className="text-lg font-semibold">MATCH HISTORY</h3>
        </div>
      </div>
    </div>
  </div>
</div>1>
    </div>
  );
}
