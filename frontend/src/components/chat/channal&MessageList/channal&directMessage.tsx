"use client";

import CreateChannal from "../modelCreateChannal/createChannal";
import { useEffect, useState } from "react";
import socket from "@/services/socket";
import ListUsersFriends from "./listUsersFriends/listUsersFriends";
import { useIsDirectMessage } from "@/store/userStore";
import { useChannleTypeStore } from "@/store/channelStore";
import useUsernameStore from "@/store/usernameStore";

export default function ChannalAndDirectMessage({ user, switchChannelName,setChannalPageAndSavedefaultName }: 
  { user: any, switchChannelName: any, setChannalPageAndSavedefaultName:any }) {

  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();

  const { channel, setChannel } = useChannleTypeStore();
  const [channels, setChannels] = useState<string[]>([]);
  const {username, setUsername} =  useUsernameStore();
  const [invite, setInvite] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // This function will be passed as a prop to Child1
  const addChannel = (channelName: any) => {
    // Add the new channel name to the existing list of channels
    setChannels([...channels, channelName]);
    if (username !== "") {
      socket.emit("saveChannelName", {
        channel: channelName,
        channelType: channel,
        sender: username,
      });
    }
  };

  // todo add this to costum hook
  useEffect(() => {
    // Search for the username and set it in the state
    async function fetchUsername() {
      const storedUserData = sessionStorage.getItem("user-store");
      if (storedUserData) {
        try {
          // Parse the stored data as JSON
          const userData = await JSON.parse(storedUserData);

          // Access the username property
          const saveusername = userData.state.user.username;

          setUsername(saveusername);
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      } else {
        console.warn("User data not found in session storage.");
      }
    }

    fetchUsername(); // Fetch the username

    // Return a cleanup function if needed (e.g., to unsubscribe from listeners)
    return () => {
      // Clean up any event listeners or subscriptions
    };
  }, []); // Empty dependency array to run this effect only once
  
  // get all channels
  useEffect(() => {
    if (username !== "") {
      socket.emit("listChannels", {
        sender: username,
        channel: channels,
      });

      // data returned from server as array of objects
      socket.on("listChannels", (data) => {
        if (!data || data[0]?.user.username !== username ) return;
        data.map((channel: any) => {
          if (channel.name === "general") return;
          setChannels((prevChannels) => [...prevChannels, channel.name]);
        });
      });
    }
  }, [username]);

  const InviteToChannel = (channelName: any, friend: string) => {
    setInvite(!invite);
    socket.emit("getAllUsers", {sender: username});
    socket.on("getAllUsers", (data) => {
      setUsers(data);
    });
    socket.emit("sendInviteToChannel", {
      sender: username,
      friend: friend,
      channel: channelName,
    });
  }

  return (
    <div className="list-div bg-slate-900 mr-10 ml-10 text-purple-lighter  w-96  hidden lg:block rounded-2xl overflow-hidden border border-gray-800">
      {/* <!-- Sidebar Header --> */}
      <div className="text-white mb-2 mt-3 px-4  flex justify-between">
        <div className="flex-auto ">
          <div className="flex items-center justify-between">
            <hr />
            <span>
              <svg
                className="w-6 h-6 text-whote opacity-75 dark:text-white cursor-pointer "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                channels
                <path d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* channels  */}
      <div className="mb-8">
        <div className="px-4 mb-2 text-white flex justify-between items-center">
          <div className="opacity-40 text-white font-thin shadow-lg ">
            Channels
          </div>
          <div>
            <CreateChannal addChannel={addChannel} />
          </div>
        </div>
        <div
          className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
          onClick={() => setChannalPageAndSavedefaultName()}
        >
          <div className="flex justify-between">
            <p>
              # general
            </p>
          </div>

        </div>
        <ul>
          {channels.map((channelName, index) => (
            <li
              className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
              key={index}
              onClick={() => switchChannelName(channelName)}
            >

              <div className="flex justify-between">
                <p>
                  # {channelName}
                </p>
                <span
                onClick={() => InviteToChannel(channelName, "")}>
                  <svg className="w-4 h-4 text-gray-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                </svg>
                </span>
              </div>
            </li>
          ))}
        </ul>
          {
            invite && (
              // add menu card to list all users to invite
              <>
                <div className="rounded-xl border border-gray-600 my-3">
                {
                  users.map((user, index) => {
                    return (
                      // display all users on middle of screen
                      <div className="flex justify-between items-center space-x-2 py-2  cursor-pointer 
                      px-4 mb-2 text-white 
                      " key={index}
                      >
                        <div className="flex  py-2 text-white font-bold cursor-pointer rounded-lg shadow-lg bg-backgroundColorPrimery border-gray-600 hover:bg-slate-900 hover:text-green-300">
                        <img src={user.avatarUrl} alt="user" className="w-8 h-8 mr-5 rounded-full" />
                          <p>{user.username}</p>
                        </div>
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-thin px-8 ml-2 rounded-full py-2 "
                          onClick={() => InviteToChannel(channel, user.username)}
                        >
                          invite
                        </button>
                      </div>
                    );
                  },)
                }
                  
                </div>
              </>
            )
          }
      </div>

      {/* direct messages */}

      <div className="mb-[420px]">
        <div className="px-4 mb-2 text-white flex justify-between items-center">
          <span
            className="opacity-40 text-white font-thin shadow-lg 
          "
          >
            Direct Messages
          </span>
        </div>
        <ListUsersFriends username={username} />
      </div>
    </div>
  );
}
