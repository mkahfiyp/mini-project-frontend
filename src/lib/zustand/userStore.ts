import { create } from "zustand";
import {persist} from "zustand/middleware";

type UserState = {
    username: string | null;
    point: number;
    setUsername: (username: string | null) => void;
    setPoint: (point: number) => void;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            username: null,
            point: 0,
            setUsername: (username) => set({ username }),
            setPoint: (point) => set({point}),
        }),
        {
            name: "user-storage",
        }
    )
);