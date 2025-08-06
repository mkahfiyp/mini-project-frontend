"use client";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/helper/apiCall";
import { Combobox } from "@/components/me/Combobox";
import { useState } from "react";

type FormValues = {
    event_id: string;
    name: string;
    kategori: string;
    deskripsi: string;
    harga: string;
    kuota: string;
    aktif: boolean;
    start_date: string;
    end_date: string;
};

export default function CreateTicketForm({ events, onSuccess }: { events: { event_ID: number, name: string }[], onSuccess?: () => void }) {
    const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            event_id: "",
            name: "",
            kategori: "",
            deskripsi: "",
            harga: "",
            kuota: "",
            aktif: true,
            start_date: "",
            end_date: "",
        }
    });
    const [message, setMessage] = useState("");

    const handleComboboxChange = (val: string, field: keyof FormValues) => {
        setValue(field, val);
    };

    const onSubmit = async (data: FormValues) => {
        setMessage("");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("tkn") : null;
            await apiCall.post("/ticket", {
                event_id: Number(data.event_id),
                name: data.name,
                kategori: data.kategori,
                deskripsi: data.deskripsi,
                harga: parseFloat(data.harga),
                kuota: parseInt(data.kuota),
                aktif: data.aktif,
                start_date: data.start_date,
                end_date: data.end_date,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage("Ticket created successfully!");
            reset();
            if (onSuccess) onSuccess();
        } catch (err) {
            setMessage("Failed to create ticket.");
        }
    };

    return (
        <Card className="mx-auto">
            <CardHeader>
                <CardTitle>Create Ticket</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Combobox
                            value={watch("event_id")}
                            onChange={(val) => handleComboboxChange(val, "event_id")}
                            items={events.map((val) => ({
                                value: String(val.event_ID),
                                label: val.name,
                            }))}
                            placeholder="Select Event"
                            label="Event"
                        />
                        {errors.event_id && <span className="text-red-500 text-xs">Event wajib dipilih</span>}
                    </div>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name", { required: true })} />
                        {errors.name && <span className="text-red-500 text-xs">Nama wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="kategori">Kategori</Label>
                        <Input id="kategori" {...register("kategori", { required: true })} />
                        {errors.kategori && <span className="text-red-500 text-xs">Kategori wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="deskripsi">Deskripsi</Label>
                        <Input id="deskripsi" {...register("deskripsi", { required: true })} />
                        {errors.deskripsi && <span className="text-red-500 text-xs">Deskripsi wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="harga">Harga</Label>
                        <Input id="harga" type="number" min={0} {...register("harga", { required: true, min: 0 })} />
                        {errors.harga && <span className="text-red-500 text-xs">Harga tidak boleh minus</span>}
                    </div>
                    <div>
                        <Label htmlFor="kuota">Kuota</Label>
                        <Input id="kuota" type="number" min={0} {...register("kuota", { required: true, min: 0 })} />
                        {errors.kuota && <span className="text-red-500 text-xs">Kuota tidak boleh minus</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input id="aktif" type="checkbox" {...register("aktif")} />
                        <Label htmlFor="aktif">Aktif</Label>
                    </div>
                    <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" type="datetime-local" {...register("start_date", { required: true })} />
                        {errors.start_date && <span className="text-red-500 text-xs">Start date wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" type="datetime-local" {...register("end_date", { required: true })} />
                        {errors.end_date && <span className="text-red-500 text-xs">End date wajib diisi</span>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Ticket"}
                    </Button>
                    {message && <p className="text-sm mt-2">{message}</p>}
                </form>
            </CardContent>
        </Card>
    );
}