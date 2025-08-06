import { apiCall } from "@/helper/apiCall";

export class UserProfileFetcher {
    async fetch(setUsername?: (val: string) => void, setPoint?: (val: number) => void) {
        const token = localStorage.getItem("tkn");
        if (!token) return;
        const { data } = await apiCall.get("/user", {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(data);
        if (setUsername) {
            setUsername(data.username);
        }
        if (setPoint) {
            setPoint(data.points);
        }
    }
}