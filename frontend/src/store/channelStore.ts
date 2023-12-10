import { create } from "zustand";

type IsChannelType = {
    isChannel: boolean;
    setIsChannel: (isChannel: boolean) => void;
    }

const useIsChannel = create<IsChannelType>((set) => ({
    isChannel: false,
    setIsChannel: (isChannel: boolean) => set({ isChannel }),
    }));

    type ChannelStoreType = {
        channel: string;
        setChannel: (channel: string) => void;
      }
    // state to store the channel name
    const useChannleTypeStore = create<ChannelStoreType>((set) => ({
        channel: "general",
        setChannel: (channel: string) => set({ channel }),
      }));
    

export default useIsChannel;
export  {useChannleTypeStore};
