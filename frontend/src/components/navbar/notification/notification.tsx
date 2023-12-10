import socket from "@/services/socket";
import { useState, useEffect } from "react";

const Notification = ({ user }: { user: any }) => {
  const [notificationForFriend, setNotificationForFriend] = useState(false);
  const [sender, setSender] = useState<any[]>([]);
  const [senderUsername, setSenderUsername] = useState("");
  const [channelname, setChannelname] = useState("");

  useEffect(() => {
    socket.on("notification", (data) => {      
      // save data to state as array
      console.log("notification", data);
        setSender((sender) => [...sender, data]);
        // save username to state
        setSenderUsername(data.username);
        
    });

    // socket.on("sendInviteToChannel", (data) => {
    
    // });
 

    return () => {
      // Clean up socket event listener when component unmounts
      socket.off("notification");
    };
  }, []);


  const saveFriendsToDB = async (senderUsername: string) => {

    // add sender to reciever friends list
    socket.emit("acceptFriendRequest", {
      sender: senderUsername,
      receiver: user.username,
    });

    socket.on("acceptFriendRequest", (data) => {
      console.log("acceptFriendRequest", data);
    });
    
    // display none notification
    setNotificationForFriend(!notificationForFriend);
  };

  return (
    <>
      <div className="relative m-6 inline-flex w-fit">
        <div className="nav-avatars_notificationIcon">
          <div className="notification-badge"></div>
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 16 21"
            onClick={() => setNotificationForFriend(!notificationForFriend)}
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 3.464V1.1m0 2.365a5.338 5.338 0 0 1 5.133 5.368v1.8c0 2.386 1.867 2.982 1.867 4.175C15 15.4 15 16 14.462 16H1.538C1 16 1 15.4 1 14.807c0-1.193 1.867-1.789 1.867-4.175v-1.8A5.338 5.338 0 0 1 8 3.464ZM4.54 16a3.48 3.48 0 0 0 6.92 0H4.54Z"
            />
          </svg>
          {notificationForFriend &&  user?.username !== senderUsername && (
            <div className="absolute top-0 right-0 w-64 p-2 mt-12 bg-white rounded-md shadow-xl dark:bg-gray-800">
                {
                sender.map((sender) => (
                    <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <img
                        className="object-cover w-8 h-8 rounded-full"
                        src={sender.avatarUrl}
                        alt="avatar"
                        />
                        <p className="mx-2 text-sm text-gray-800 dark:text-gray-200">
                        {sender.username}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <button className="px-2 py-1 mr-2 text-xs text-green-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-green-400"
                        onClick={() => {saveFriendsToDB(sender.username)}}
                        >
                        Accept
                        </button>
                        <button className="px-2 py-1 text-xs text-red-600 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-red-400">
                        Reject
                        </button>
                    </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>

    </>
  );
};

export default Notification;
