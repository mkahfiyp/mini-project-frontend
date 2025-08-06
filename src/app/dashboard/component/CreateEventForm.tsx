"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/me/Combobox";
import { apiCall } from "@/helper/apiCall";
import { useRouter } from "next/navigation";

type Category = { category_id: number; name: string };
type City = { city_id: number; name: string };

type Props = {
    dataCategory: Category[];
    dataCity: City[];
};

export default function CreateEventForm({ dataCategory, dataCity }: Props) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [price, setPrice] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [cityId, setCityId] = useState("");
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (new Date(endDate) < new Date(startDate)) {
            alert("End date cannot be earlier than start date.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("tkn");
            if (!token) {
                alert("Please login first.");
                router.replace("/login");
                return;
            }
            const startDateISO = new Date(startDate).toISOString();
            const endDateISO = new Date(endDate).toISOString();

            await apiCall.post("/event", {
                name,
                deskripsi,
                price: parseFloat(price),
                start_date: startDateISO,
                end_date: endDateISO,
                location,
                category_id: Number(categoryId),
                city_id: Number(cityId),
                image,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Event created successfully!");
            setName("");
            setDeskripsi("");
            setPrice("");
            setStartDate("");
            setEndDate("");
            setLocation("");
            setCategoryId("");
            setCityId("");
            setImage("");
        } catch (error: any) {
            alert("Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Create Event</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Event Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Event Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="deskripsi">Description</Label>
                        <Input
                            id="deskripsi"
                            type="text"
                            placeholder="Description"
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="datetime-local"
                            placeholder="Start Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            type="datetime-local"
                            placeholder="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Combobox
                            value={categoryId}
                            onChange={setCategoryId}
                            items={dataCategory.map((cat) => ({
                                value: String(cat.category_id),
                                label: cat.name,
                            }))}
                            placeholder="Select Category"
                            label="Category"
                        />
                    </div>
                    <div>
                        <Combobox
                            value={cityId}
                            onChange={setCityId}
                            items={dataCity.map((city) => ({
                                value: String(city.city_id),
                                label: city.name,
                            }))}
                            placeholder="Select City"
                            label="City"
                        />
                    </div>
                    <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                            id="image"
                            type="text"
                            placeholder="Image URL"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Event"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}