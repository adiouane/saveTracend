"use client";
import { useIsDirectMessage } from "@/store/userStore";
import { useEffect, useState } from "react";
import socket from "@/services/socket";
import { useChannleIdStore } from "@/store/channelStore";

export default function AdminsMembers({
  user,
  channel,
}: {
  user: any;
  channel: string;
}) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { channelId, setChannelId } = useChannleIdStore(); // channel id
  const [members, setMembers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [Setting, setSetting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ShowTimeMuted, setShowTimeMuted] = useState<boolean>(false);
  const [member, setMember] = useState<string>("");
  const [sender, setSender] = useState<string>("");
  const [justMemebre, setJustMemebre] = useState<boolean>(false);
  const [disableListMembers, setDisableListMembers] = useState<boolean>(false);
  const [showMembersAndAdminsCmp, setShowMembersAndAdmins] =
    useState<boolean>(false);

  const listMembers = (channelId: string) => {
    socket.emit("getChannelById", { id: channelId });
    socket.on("getChannelById", (data: any) => {
      if (data?.visibility === "public" || data?.visibility === "protected") {
        setDisableListMembers(true);
        return;
      } else {
        setMembers([]);
        setAdmins([]);
        const username = user?.username;
        socket.emit("ChannelMembers", { channelId, username });
        socket.on("ChannelMembers", (data: any) => {
          // TODO: filter the sender
          data?.map((member: any) => {
            // filter the owner and admins
            setMembers(data);
          });
        });
      }
    });
  };

  const listAdmins = (channelId: string) => {
    setMembers([]);
    setAdmins([]);
    // list all admins in the channel
    socket.emit("GetChannelAdmins", { channelId });
    socket.on("GetChannelAdmins", (data: any) => {
      // console.log("admins: ", data);
      for (let i = 0; i < data.length; i++) {
        setAdmins((admins) =>
          [...admins, data[i]?.user].filter(
            (v, i, a) => a.findIndex((t) => t?.username === v?.username) === i
          )
        );
      }
    });
  };

  // list all members in the channel
  useEffect(() => {
    if (channelId) {
      setMembers([]);
      setAdmins([]);
      listMembers(channelId);
      listAdmins(channelId);
    }
    return () => {
      socket.off("ChannelMembers");
      socket.off("ChannelAdmins");
      socket.off("getUserById");
      setDisableListMembers(false);
    };
  }, [channelId]);

  const makeAdmin = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("makeAdmin", { sender, member, channelId });
    socket.on("makeAdmin", (data: any) => {
      if (!data) {
        alert("you are not the owner or admin of the channel");
        return;
      } else {
        alert("admin added");
      }
      setSetting(!Setting);
    });
  };

  const kickMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("kickMember", { sender, member, channelId });
    socket.on("kickMember", (data: any) => {
      if (!data) {
        alert("you are not the owner or admin of the channel");
        return;
      } else {
        alert("member kicked");
      }
      setSetting(!Setting);
    });
  };

  const BanMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);
    socket.emit("BanMember", { sender, member, channelId });
    socket.on("BanMember", (data: any) => {
      if (!data) {
        alert("you can't ban the member");
        return;
      } else {
        alert("member banned");
      }
      setSetting(!Setting);
    });
  };

  const MuteMember = (member: string, channelId: string) => {
    setSender(user?.username);
    setMember(member);

    // Calculate the time when the mute will end
    const muteDuration = 20 * 1000; // 20 seconds
    // const unmuteTime = new Date().getTime() + muteDuration;

    let Muted = false;
    // Emit a socket event to the server to mute the member
    socket.emit("MuteMember", { sender, member, channelId, Muted });
    socket.on("MuteMember", (data: any) => {
      if (data === "owner muted member") {
        setShowTimeMuted(!ShowTimeMuted);
      } else if (data === "admin muted member") {
        setShowTimeMuted(!ShowTimeMuted);
      } else {
        setJustMemebre(!justMemebre);
      }
    });

    // wait for time to end
    setTimeout(() => {
      Muted = true;
      socket.emit("MuteMember", { sender, member, channelId, Muted });
    }, muteDuration);
  };

  const close = () => {
    setSetting(!Setting);
    setShowTimeMuted(!ShowTimeMuted);
    setJustMemebre(false);
  };

  const hideAdminsMembers = () => {
    const adminMembers = document.querySelector(".adminMembers");
    if (adminMembers?.classList.contains("hidden"))
      adminMembers?.classList.remove("hidden");
    else adminMembers?.classList.toggle("hidden");

    setShowMembersAndAdmins(!showMembersAndAdminsCmp);
  };

  return (
    <>
      {channel === "general" || disableListMembers ? (
        <div></div>
      ) : (
        <>
          <button
            className="absolute top-0 right-0  mt-2 mr-3 flex items-center"
            onClick={() => hideAdminsMembers()}
          >
            <img
              className="h-7 w-7 bg-slate-300 rounded-2xl border hover:bg-green-400"
              src="https://cdn3.iconfinder.com/data/icons/basic-mobile-part-2/512/large_group-512.png"
              alt=""
            />
          </button>
          {showMembersAndAdminsCmp && (
            <div
              className="bg-slate-900 rounded-2xl border border-gray-700 adminMembers
    "
            >
              {!isDirectMessage ? (
                <>
                  {/* admins */}
                  <button
                    className=" rounded-3xl p-3"
                    onClick={() => hideAdminsMembers()}
                  >
                    <img
                      className="h-7 w-7 bg-slate-300 rounded-2xl border hover:bg-green-400"
                      src="https://cdn3.iconfinder.com/data/icons/squared-business-financial/64/delete-cancel-512.png"
                      alt=""
                    />
                  </button>
                  <h3 className=" font-light text-white pl-8 py-10 opacity-50">
                    # Admins
                  </h3>
                  {admins?.map((admin, index) => (
                    <div
                      key={admin?.username}
                      className="flex flex-col items-center relative w-56 mb-5 
                        -ml-10 2xl:flex-row 2xl:justify-start 2xl:items-center 2xl:ml-10"
                    >
                      <img
                        src={admin?.avatarUrl}
                        alt=""
                        className="rounded-full h-14 -ml-5 mr-2 "
                      />
                      <span className="text-white font-bold  opacity-90 2xl:ml">
                        {admin?.username}
                      </span>
                    </div>
                  ))}
                  {/* members */}
                  <h3 className=" font-light text-white pl-8 py-10 opacity-50">
                    # Members
                  </h3>

                  {members?.map((member, index) => (
                    <div key={member?.username} className="ml-8 w-56 mb-5">
                      <div
                        className="flex flex-row items-center "
                      >
                        <img
                          src={member?.avatarUrl}
                          alt=""
                          className="rounded-full h-14 "
                        />
                        <button
                          className="border rounded-3xl text-sm p-1 ml-6 border-gray-700 hover:bg-gray-700 "
                          onClick={() => setSetting(!Setting)}
                        >
                          <img
                            className="h-7 w-7 bg-slate-300 rounded-2xl hover:bg-green-400"
                            src="https://cdn4.iconfinder.com/data/icons/yuai-mobile-banking-vol-1/100/yuai-1-09-512.png"
                            alt=""
                          />
                        </button>
                      </div>
                      <div>
                      <span className="text-white font-bold  opacity-90">
                        {member?.username}
                      </span>
                      </div>

                      {Setting && (
                        <div className="absolute top-0 right-0 bottom-0 bg-slate-800 w-[400px] h-[810px] rounded-lg flex flex-col items-center justify-center">
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border border-gray-700 hover:bg-gray-700"
                            onClick={() =>
                              makeAdmin(member.username, channelId)
                            }
                          >
                            Make Admin
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              kickMember(member.username, channelId)
                            }
                          >
                            Kick User
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              BanMember(member.username, channelId)
                            }
                          >
                            Ban User
                          </button>
                          <button
                            className="bg-slate-900 text-white rounded-lg px-4 py-2 my-2 mb-2 w-96 font-sans border  border-gray-700 hover:bg-gray-700
                  "
                            onClick={() =>
                              MuteMember(member.username, channelId)
                            }
                          >
                            Mute User
                          </button>
                          {ShowTimeMuted && !justMemebre && (
                            <div className="flex flex-col items-center justify-center">
                              <h6 className="text-white font-thin text-xl">
                                <span className="text-red-500">
                                  User{" "}
                                  <span className="text-blue-400">
                                    {" "}
                                    {member.username}{" "}
                                  </span>
                                  is Muted{" "}
                                  <span className="text-blue-400">
                                    {" "}
                                    for 1 minute
                                  </span>
                                </span>
                              </h6>
                            </div>
                          )}
                          {justMemebre && !ShowTimeMuted && (
                            <div className="flex flex-col items-center justify-center">
                              <h6 className="text-white font-thin text-xl">
                                <span className="text-red-500">
                                  You Can't Mute{" "}
                                  <span className="text-blue-400">
                                    {" "}
                                    {member.username}{" "}
                                  </span>
                                </span>
                              </h6>
                            </div>
                          )}
                          <button
                            className=" mr-70 border rounded-3xl text-sm p-1 max-w-20 border-gray-700 hover:bg-gray-700 "
                            onClick={() => close()}
                          >
                            close
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <hr />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
