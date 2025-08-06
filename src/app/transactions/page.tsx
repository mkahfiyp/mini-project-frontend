"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiCall } from "@/helper/apiCall";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TransactionPage() {
    const router = useRouter();
    const [transaction, setTransaction] = useState([]);

    const getTransaction = async () => {
        const token = localStorage.getItem("tkn");
        const { data } = await apiCall.get("/transaction", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setTransaction(data);
        console.log(data)
    }

    useEffect(() => {
        if (!localStorage.getItem("tkn")) {
            router.replace("/login")
        }
        getTransaction();
    }, [])

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {transaction.length === 0 ? (
                        <p>Tidak ada transaksi.</p>
                    ) : (
                        transaction.map((trx: any) => (
                            <Card key={trx.transaction_id} className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">Kode Transaksi: {trx.transaction_code}</CardTitle>
                                    <CardDescription>
                                        Status: <span className={trx.status === "canceled" ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                                            {trx.status === "canceled" ? "Canceled" : trx.status}
                                        </span>
                                    </CardDescription>
                                    {trx.Event && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <span className="font-semibold">Event: {trx.Event.name}</span>
                                            <div>Lokasi: {trx.Event.location}</div>
                                            <div>Jadwal Event: {new Date(trx.Event.start_date).toLocaleDateString("id-ID")} - {new Date(trx.Event.end_date).toLocaleDateString("id-ID")}</div>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {trx.Ticket && (
                                        <div className="mb-2">
                                            <div className="font-semibold">Tiket: {trx.Ticket.name} ({trx.Ticket.kategori})</div>
                                            <div className="text-xs text-muted-foreground">{trx.Ticket.deskripsi}</div>
                                            <div className="text-xs">Harga: Rp{trx.Ticket.harga.toLocaleString("id-ID")}</div>
                                        </div>
                                    )}
                                    <div className="text-sm mb-1">
                                        Metode Pembayaran :
                                        {
                                            trx.payment_method !== null ? (
                                                ` ${trx.payment_method.replace("-", " ")}`
                                            ) : (
                                                " -"
                                            )
                                        }
                                    </div>
                                    <div className="text-sm mb-1">
                                        Point Digunakan: {trx.used_point}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Deadline Pembayaran: {new Date(trx.payment_deadline).toLocaleString("id-ID")}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    {
                                        trx.Ticket.end_date < new Date().toISOString() && trx.status === "COMPLETED" && (
                                            <Button>Review</Button>
                                        )
                                    }
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}