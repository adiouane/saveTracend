import { useState } from "react";
import { useIsDirectMessage } from "@/store/userStore";
import useRecieverStore from "@/store/recieverStore";
import AdminsMembers from "../../adminMembers/adminMembers";

export default function TopBar({
  user,
  username,
  channel,
}: {
  user: any;
  username: string;
  channel: string;
}) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  const { reciever, setReciever } = useRecieverStore();
  const [isDirectMessagePage, setIsDirectMessagePage] = useState(false);
  //TODO: WSALT HNA ADD RESPONSIVE FOR FRIENDS LIST


  const showAdminsMembers = () => {
    // remove display none from '.adminMembers' 
    const adminMembers = document.querySelector(".adminMembers");
    alert(adminMembers?.classList.contains("hidden"))
    if (adminMembers?.classList.contains("hidden"))
      adminMembers?.classList.remove("hidden");
    else
      adminMembers?.classList.toggle("hidden");
  }

  return (
    <>
      <div className="border-b flex px-6 py-2 items-center justify-between flex-none ">
        {/* name of channal */}
        <div className="flex flex-col ">
          <div className="lg[1000px]:hidden"></div>
          <h3 className=" mb-1 font-extrabold flex items-center">
            <img
              src="https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678109-profile-group-256.png"
              alt=""
              className="mr-2 lg:hidden w-7 h-7 cursor-pointer"
              onClick={() => {
                setIsDirectMessagePage(!isDirectMessagePage);
              }}
            />
            <span className="text-xl font-bold opacity-50">#</span>{" "}
            {isDirectMessage ? reciever : channel}
          </h3>
        </div>

        {/* picture profile  */}

        <div className="ml-auto  lg:block">
          <div className="relative">
            {/* megamenu profile */}
            <div className="absolute top-0 right-0  -mt-5 flex items-center">
              {/* <!-- drawer component --> */}
              <button
                onClick={() =>  showAdminsMembers()}
                className="cursor-pointer my-2 w-5"
                type="button"
              >
                <div className="flex ">
                  <img
                    className="h-5 w-5 bg-slate-100 rounded-sm "
                    src="https://cdn2.iconfinder.com/data/icons/user-interface-jumpicon-line/32/-_Equaliser_Control_Panel_Setting_Adjustment_Configuration_System-256.png"
                    alt=""
                  />
                </div>
              </button>

           
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
