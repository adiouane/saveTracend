"use client";
import "./page.css";
import ChannalAndDirectMessage from "@/components/chat/channal&MessageList/channal&directMessage";
import ChatContent from "@/components/chat/chatContent/chatContent";
import AdminsMembers from "@/components/chat/adminMembers/adminMembers";
import React, { useState } from "react";
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
  const [channel, setChannel] = useState("general");
  const [isChannel, setIsChannel] = useState(false);

  function switchChannelName(channelName: any) {
    setIsDirectMessage(false);
    setChannel(channelName);
  }

  function setChannalPageAndSavedefaultName() {
    setIsDirectMessage(false);
    setIsChannel(true);
    setChannel("general");
  }


  return (
    <div className="chat-container">
      <div className="flex h-full">
          <ChannalAndDirectMessage user={user} switchChannelName={switchChannelName} 
          setChannalPageAndSavedefaultName={setChannalPageAndSavedefaultName}/>
            <ChatContent user={user} channel={channel} />
        {!isDirectMessage ? (
          <>
            <AdminsMembers user={user} />
          </>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
