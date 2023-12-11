import { create } from "zustand";

    type ChannelStoreType = {
        channel: string;
        setChannel: (channel: string) => void;
      }
    // state to store the channel name
    const useChannleTypeStore = create<ChannelStoreType>((set) => ({
        channel: "general",
        setChannel: (channel: string) => set({ channel }),
      }));
    
export  {useChannleTypeStore};
