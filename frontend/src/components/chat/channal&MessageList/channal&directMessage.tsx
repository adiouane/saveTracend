"use client";

import CreateChannal from "../modelCreateChannal/createChannal";
import { use, useEffect, useState } from "react";
import socket from "@/services/socket";
import ListUsersFriends from "./listUsersFriends/listUsersFriends";
import { useIsDirectMessage } from "@/store/userStore";
import { useChannleIdStore, useChannleTypeStore } from "@/store/channelStore";
import useUsernameStore from "@/store/usernameStore";

export default function ChannalAndDirectMessage({ user, switchChannelName, setChannalPageAndSavedefaultName }: 
  { user: any, switchChannelName: any, setChannalPageAndSavedefaultName:any }) {

    const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
    
    const { channel, setChannel } = useChannleTypeStore(); // channel name
    const { channelId, setChannelId } = useChannleIdStore(); // channel id
    const [channels, setChannels] = useState<string[]>([]); // list of channels
    const {username, setUsername} =  useUsernameStore();
    const [invite, setInvite] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [inviteToChannel, setInviteToChannel] = useState([]);
    const [channelWithIdAndName, setChannelWithIdAndName] = useState<any[]>([]); // list of channelsId
    const [acceptedChannels, setAcceptedChannels] = useState<any[]>([]); // list of channelsId
    const [publicChannels, setPublicChannels] = useState<any[]>([]); // list of channelsId
    const [isListChannel, setIsListChannel] = useState(false); // list of channelsId
    const [protectedChannel, setProtectedChannel] = useState<any[]>([]); // list of channelsId
    const [password, setPassword] = useState(''); // list of channelsId
    // TODO: add this to costum hook
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
    }, []); // Empty dependency array to run this effect only once


  // This function will be passed as a prop to Child1
  const addChannel = (channelName: any, password: any) => {
    // Add the new channel name to the existing list of channels
    setChannels([...channelWithIdAndName, channelName]);
    // encrypt password using nestjs bcrypt
    // const encreptPassword = btoa(password);
    setPassword(password);
    if (username !== "") {
      socket.emit("saveChannelName", {
        channel: channelName,
        channelType: channel,
        sender: username,
        channelId: channelId,
        password: password,
      });
      setIsListChannel(true);
    }
  };


  const listChannels = () => {
    if (username !== "") {
      socket.emit("listChannels", {
        sender: username,
      });

      // list all owned channels
      socket.on("listChannels", (data :any) => {
        if (!data || data[0]?.user.username !== username ) return;
        data.map((channel: any) => {
          if (channel.name === "general" || channel.visibility === "protected") return; // becuase protected channel will be listed in the protected channel list
          // save data to state as array
          setChannelWithIdAndName((channelWithIdAndName) => [...channelWithIdAndName, channel]);
        });
      });

      // list all accepted channels
      socket.emit("listAcceptedChannels", {
        sender: username,
      });
      socket.on("listAcceptedChannels", (data :any) => {  
        socket.emit("getChannelById", {
          sender: username,
          id: data[0]?.idOfChannel,
        })
        socket.on("getChannelById", (data :any) => {
          // save data to state as array with checkin if the channel is already exist in the state and remove it if it does
          setAcceptedChannels((prevAcceptedChannels) => {
            const isAcceptedChannelExist = prevAcceptedChannels.some((ac) => ac.id === data.id);
            return isAcceptedChannelExist ? prevAcceptedChannels : [...prevAcceptedChannels, data];
          });
        })
      });

      // list all public channels
      socket.emit("listPublicChannels", {
        sender: username,
      });
      socket.on("listPublicChannels", (data :any) => {        
        setPublicChannels(data.filter((channel:any) => channel.name !== "general"));
      });

      // list all protected channels
      socket.emit("listProtectedChannels", {
        sender: username,
      });
      socket.on("listProtectedChannels", (data :any) => {        
        setProtectedChannel(data.filter((channel:any) => channel.name !== "general"));
      });
    }
  };

  
  // list all channels
  useEffect(() => {
    listChannels();
    return () => {
      socket.off("listChannels");
      socket.off("listAcceptedChannels");
      socket.off("getChannelById");
      socket.off("listPublicChannels");
    };
  }, [username]);


  const InviteToChannel = (channelName: any, friend: string) => {
    setIsDirectMessage(false);
    if (channelName === "general") return;
    socket.emit("sendInviteToChannel", {
      sender: username,
      friend: friend,
      channel: channelName,
      status: "pending",
    });
    socket.on("sendInviteToChannel", (data) => {
      // save data to state as array
      setInviteToChannel([...inviteToChannel, data] as any);
    });
    setInvite(!invite);
  }

  const listFriends = () => {
    setInvite(!invite);
    setIsDirectMessage(false);
    socket.emit("getAllUsers", {
      sender: username,
    });
    socket.on("getAllUsers", (data : any) => {
      // save data to state as array
      const usersArry = [];
      for (let i = 0; i < data.length; i++) {
        usersArry.push(data[i]);
      }
      // filter out the user who send the invite
      const filterOutUser = usersArry.filter((user) => user.username !== username);
      setUsers(filterOutUser);
    });
  }

  const saveCurrentChannel = (channelName: string, id: string) => {
    setChannel(channelName);
    setChannelId(id);
    switchChannelName(channelName);
  };



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
            <CreateChannal addChannel={addChannel}
             />
          </div>
        </div>
        <div
          className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer "
          onClick={() => setChannalPageAndSavedefaultName()}
        >
          <div className="flex justify-between">
            <p>
              # general
            </p>
          </div>

        </div>
        <ul className="overflow-y-auto h-[120px]">

          {channelWithIdAndName.map((channel, index) => (
            <li
              className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
              key={channel.id}
              onClick={() => saveCurrentChannel(channel.name, channel.id)}
            >

              <div className="flex justify-between">
                <p>
                  # {channel.name}
                </p>
                <span
                onClick={() => listFriends()}>
                  <svg className="w-4 h-4 text-gray-500 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Zm11-3h-2V5a1 1 0 0 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 0 0 2 0V9h2a1 1 0 1 0 0-2Z" />
                </svg>
                </span>
              </div>
            </li>
          ))}
          {
            acceptedChannels && acceptedChannels.map((channel, index) => (
              <li
                className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                key={channel.id}
                onClick={() => saveCurrentChannel(channel.name, channel.id)}
              >
                <div className="flex justify-between">
                  <p>
                    # {channel.name}
                  </p>
                </div>
              </li>
            ))
          }
          {
            publicChannels 
            && publicChannels.map((channel, index) => (
              <li
                className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                key={channel.id}
                onClick={() => saveCurrentChannel(channel.name, channel.id)}
              >
                <div className="flex justify-between">
                  <p>
                    # {channel.name}
                  </p>
                </div>
              </li>
            ))
          }
          {
            protectedChannel 
            && protectedChannel.map((channel, index) => (
              <li
                className="bg-teal-dark py-4 px-4 text-gray-400 font-bold  hover:bg-slate-700 hover:text-white hover:opacity-100 rounded-2xl cursor-pointer"
                key={channel.id}
                onClick={() => saveCurrentChannel(channel.name, channel.id)}
              >
                <div className="flex justify-between">
                  <p>
                  🔒 {channel.name}
                  </p>
                </div>
              </li>
            ))
          }
        </ul>
          {
            invite && users.length > 0 && (
              // add menu card to list all users to invite
              <>
                <div className="rounded-xl border border-gray-600 m-2">
                {
                  users.map((user, index) => {
                    return (
                      <div key={index} className="flex justify-between items-center m-2">
                        <div className="flex items-center">
                          <img
                            className="object-cover w-8 h-8 rounded-full"
                            src={user.avatarUrl}
                            alt="avatar"
                          />
                          <p className="mx-2 text-base text-gray-200  dark:text-gray-200">
                            {user.username}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                            onClick={() => {InviteToChannel(channel, user.username)}}
                          >
                            Invite
                          </button>
                          <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400"
                            onClick={() => {setInvite(!invite)}}
                          >
                            ignore
                          </button>
                        </div>
                      </div>
                    )
                  }
                  )
                }
                  
                </div>
              </>
            )
          }
          {
            invite && users.length === 0 && (
              <div className="absolute top-1/4 left-1/1 z-10 w-72   bg-gray-800 rounded-xl shadow-xl flex flex-col justify-center items-center
              ">
                <p className="text-white my-5 mb-1">
                  no friends to invite
                </p>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-thin pl-4 pr-4 mb-2 py-0 rounded-full"
                  onClick={() => setInvite(!invite)}
                >
                  close
                </button>
              </div>
            )
          }
      </div>

      {/* direct messages */}

      <div className="mb-[420px] overflow-y-auto h-[400px]">
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
