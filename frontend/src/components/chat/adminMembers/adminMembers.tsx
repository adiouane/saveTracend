"use client";
import { useIsDirectMessage } from "@/store/userStore";


export default function AdminsMembers({ user } : { user: any}) {
  const { isDirectMessage, setIsDirectMessage } = useIsDirectMessage();
  return (
    <div className="bg-slate-900  pr-40 mr-40 rounded-2xl hidden lg:block admin-div border border-gray-700">
       {!isDirectMessage ? (
        <>
      {/* admins */}
      <h3 className=" font-light text-white pl-10 py-10 opacity-50">
        # Admins
      </h3>
      {/* icon is online   */}
      <span className="relative flex h-1 w-3 ml-10 mt-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
      </span>{" "}
      <div className="flex items-center  w-12 h-12 mr-2 ml-10">
        <img src={user?.avatarUrl} alt="" className="rounded-3xl" />
        <span className="text-white font-bold  opacity-90 ml-10">
          {user?.username}
        </span>
      </div>
      {/* members */}
      <h3 className=" font-light text-white pl-10 py-10 opacity-50">
        # Members
      </h3>
      {/* icon is online   */}
      <span className="relative flex h-1 w-3 ml-10 mt-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
      </span>{" "}
      <div className="flex  items-center w-12 h-12 mr-2 ml-10">
        <img src={user?.avatarUrl} alt="" className="rounded-3xl" />
        <span className="text-white font-bold  opacity-90 ml-10">
          {user?.username}
        </span>
        <button className="pl-8">
          <svg
            width="31"
            height="37"
            viewBox="0 0 21 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.8457 11.3281C16.8812 11.3281 17.7207 10.3138 17.7207 9.06251C17.7207 7.81124 16.8812 6.79688 15.8457 6.79688C14.8102 6.79688 13.9707 7.81124 13.9707 9.06251C13.9707 10.3138 14.8102 11.3281 15.8457 11.3281Z"
              fill="#FFFEFE"
            />
            <path
              d="M15.8457 20.3906C16.8812 20.3906 17.7207 19.3763 17.7207 18.125C17.7207 16.8737 16.8812 15.8594 15.8457 15.8594C14.8102 15.8594 13.9707 16.8737 13.9707 18.125C13.9707 19.3763 14.8102 20.3906 15.8457 20.3906Z"
              fill="#FFFEFE"
            />
            <path
              d="M15.8457 29.4531C16.8812 29.4531 17.7207 28.4388 17.7207 27.1875C17.7207 25.9362 16.8812 24.9219 15.8457 24.9219C14.8102 24.9219 13.9707 25.9362 13.9707 27.1875C13.9707 28.4388 14.8102 29.4531 15.8457 29.4531Z"
              fill="#FFFEFE"
              />
          </svg>
        </button>
      </div>
      </>
      ) : (
       <hr />
      )}
    </div>
  );
}
