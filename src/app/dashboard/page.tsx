"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { apiCall } from "@/helper/apiCall";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/me/Combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateEventForm from "./component/CreateEventForm";
import Image from "next/image";
import CreateTicketForm from "./component/CreateTicketForm";
import EventList from "./component/EventList";
import { Separator } from "@/components/ui/separator";
import CreateVoucherForm from "./component/CreateVoucherForm";

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"event" | "ticket" | "voucher">("event");

    // Data
    const [dataCategory, setDataCategory] = useState<any>([]);
    const [dataCity, setDataCity] = useState([]);
    const [dataEvent, setDataEvent] = useState<any>([]);
    const [dataTicket, setDataTicket] = useState<any>([]);
    const [dataVoucher, setDataVoucher] = useState<any>([]);

    const getCategories = async () => {
        try {
            const { data } = await apiCall.get("/category")
            setDataCategory(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getCity = async () => {
        try {
            const { data } = await apiCall.get("/city");
            setDataCity(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getEvent = async () => {
        try {
            const token = localStorage.getItem("tkn");
            const { data } = await apiCall.get("/event/getData/getByUser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDataEvent(data);
            // console.log(data);
        } catch (error) {
            console.log(error)
        }
    }

    const getTicket = async () => {
        try {
            const token = localStorage.getItem("tkn");
            const { data } = await apiCall.get("/ticket/getData/getByUser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setDataTicket(data)
            console.log(data);
        } catch (error) {
            console.log(error)
        }
    }

    const getVoucher = async () => {
        try {
            const token = localStorage.getItem("tkn");
            const { data } = await apiCall.get("/voucher/getAllByUser", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setDataVoucher(data);
            console.log(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("tkn");
        if (!token) {
            router.replace("/login");
        }
        getCategories();
        getCity();
        getEvent();
        getTicket();
        getVoucher();
    }, []);
    // console.log("dataEvent", dataEvent);

    return (
        <div className="w-full flex flex-col md:flex-row pt-4 px-2 md:px-5 gap-5">
            <div className="w-full">
                <Tabs
                    defaultValue={activeTab}
                    className="w-full"
                    onValueChange={(val) => setActiveTab(val as "event" | "ticket" | "voucher")}
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="event">Event</TabsTrigger>
                        <TabsTrigger value="ticket">Ticket</TabsTrigger>
                        <TabsTrigger value="voucher">Voucher</TabsTrigger>
                    </TabsList>
                    <TabsContent value="event" className="w-full">
                        <CreateEventForm dataCategory={dataCategory} dataCity={dataCity} />
                    </TabsContent>
                    <TabsContent value="ticket">
                        <CreateTicketForm events={dataEvent} onSuccess={getTicket} />
                    </TabsContent>
                    <TabsContent value="voucher">
                        <CreateVoucherForm events={dataEvent} onSuccess={getVoucher} />
                    </TabsContent>
                </Tabs>
            </div>
            <div className="w-full">
                <h2 className="text-lg font-semibold mb-4">
                    {activeTab === "event" && "Event List"}
                    {activeTab === "ticket" && "Ticket List"}
                    {activeTab === "voucher" && "Voucher List"}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {activeTab === "event" && (
                        dataEvent.length === 0 ? (
                            <p>No events found.</p>
                        ) : (
                            <EventList dataEvent={dataEvent} />
                        )
                    )}
                    {activeTab === "ticket" && (
                        dataTicket.length === 0 ? (
                            <p>No tickets found.</p>
                        ) : (
                            dataTicket.map((ticket: any) => (
                                <Card key={ticket.ticket_id} className="w-full">
                                    <CardHeader>
                                        <CardTitle>{ticket.name}</CardTitle>
                                        <CardDescription>{ticket.deskripsi}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            Kategori: {ticket.kategori}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Kuota: {ticket.kuota} &middot; {ticket.aktif ? "Aktif" : "Tidak Aktif"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(ticket.start_date).toLocaleDateString("id-ID")} - {new Date(ticket.end_date).toLocaleDateString("id-ID")}
                                        </div>
                                        <Separator />
                                        {ticket.Event && (
                                            <div className="mt-2">
                                                <div className="font-semibold">Event: {ticket.Event.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Lokasi: {ticket.Event.location}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Jadwal Event: {new Date(ticket.Event.start_date).toLocaleDateString("id-ID")} - {new Date(ticket.Event.end_date).toLocaleDateString("id-ID")}
                                                </div>
                                                {ticket.Event.image && (
                                                    <Image
                                                        src={"https://images.unsplash.com/photo-1582711012124-a56cf82307a0"}
                                                        width={600}
                                                        height={400}
                                                        alt={ticket.Event.name}
                                                        className="mb-2 rounded w-full h-32 object-cover"
                                                    />
                                                )}
                                            </div>
                                        )}
                                        <Separator />
                                        <p className="font-semibold">Harga: Rp{ticket.harga.toLocaleString("id-ID")}</p>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    )}
                    {activeTab === "voucher" && (
                        dataVoucher.length === 0 ? (
                            <p>No vouchers found.</p>
                        ) : (
                            dataVoucher.map((val: any) => (
                                <Card key={val.voucher_id} className="w-full">
                                    <CardHeader>
                                        <CardTitle>{val.code}</CardTitle>
                                        <CardDescription>
                                            Diskon: {val.discount_value}% &middot; Min. Belanja: Rp{val.min_purchase.toLocaleString("id-ID")}
                                        </CardDescription>
                                        <Separator />
                                        {val.Event && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                <span className="font-semibold">Event: {val.Event.name}</span>
                                                <div>Lokasi: {val.Event.location}</div>
                                                <div>Jadwal Event: {new Date(val.Event.start_date).toLocaleDateString("id-ID")} - {new Date(val.Event.end_date).toLocaleDateString("id-ID")}</div>
                                            </div>
                                        )}
                                        <Separator />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            Maksimal Diskon: Rp{val.max_discount.toLocaleString("id-ID")}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Berlaku: {new Date(val.start_date).toLocaleDateString("id-ID")} - {new Date(val.end_date).toLocaleDateString("id-ID")}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}