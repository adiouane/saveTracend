"use client";
import "./page.css";
import ChannalAndDirectMessage from "@/components/chat/channal&MessageList/channal&directMessage";
import ChatContent from "@/components/chat/chatContent/chatContent";
import AdminsMembers from "@/components/chat/adminMembers/adminMembers";
import React from "react";
import { useParams } from "next/navigation";
import { fetchUser } from "@/services/userServices";
import useSWR from "swr";
import { useIsDirectMessage } from "@/store/userStore";

export default function Chat() {
  const params = useParams();
  const userId = params.id;
  const { data: user, error } = useSWR(
    `http://localhost:3001/user/${userId}`,
    fetchUser
  );
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();

  return (
    <div className="chat-container">
      <div className="flex h-full">
          <ChannalAndDirectMessage user={user} />
            <ChatContent user={user} />
        {!isDirectMessage ? (
          <>
            <AdminsMembers user={user} />
          </>
        ) : (
          <div></div>
        )}
      </div>
      {/* <div className="h-20"></div> */}
    </div>
  );
}
