"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiCall } from "@/helper/apiCall";
import { Calendar, Heart, MapPin, Share2, Star, Ticket, Users } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailEventPage() {
    const params = useParams()
    const event = params.event
    const router = useRouter()

    const [detailEvent, setDetailEvent] = useState<any>(null)
    const [reviewEvent, setReviewEvent] = useState<any>(null)

    const [selectedTicket, setSelectedTicket] = useState<number | null>(null)
    const [quantity, setQuantity] = useState(1)

    const getDetail = async () => {
        if (typeof event === "string") {
            const decodedEvent = decodeURIComponent(event);
            const { data } = await apiCall.get(`/event/detail/${decodedEvent}`);
            setDetailEvent(data[0]);
        }
    };

    const getReview = async () => {
        const { data } = await apiCall.get("/review", {
            params: { eventId: detailEvent.event_ID }
        })
        setReviewEvent(data)
        // console.log(data)
    }

    useEffect(() => {
        getDetail()
    }, []);

    useEffect(() => {
        if (detailEvent) {
            getReview()
        }
    }, [detailEvent])

    function calculateAverageRating(transactions: any[]): number {
        const ratings: number[] = [];
        transactions.forEach((transaction) => {
            if (transaction.Reviews && transaction.Reviews.length > 0) {
                transaction.Reviews.forEach((review: any) => {
                    if (typeof review.rating === "number") {
                        ratings.push(review.rating);
                    }
                });
            }
        });

        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r, 0);
        return parseFloat((total / ratings.length).toFixed(2));
    }

    function getTotalTicketsSold(transactions: any[]): number {
        let total = 0;
        transactions.forEach((transaction) => {
            if (transaction.TransactionTickets && transaction.TransactionTickets.length > 0) {
                transaction.TransactionTickets.forEach((tt: any) => {
                    if (typeof tt.quantity === "number") {
                        total += tt.quantity;
                    }
                });
            }
        });
        return total;
    }

    function getTicketsSoldFor(ticketId: number, transactions: any[]): number {
        let total = 0;
        transactions.forEach((transaction) => {
            if (transaction.TransactionTickets && transaction.TransactionTickets.length > 0) {
                transaction.TransactionTickets.forEach((tt: any) => {
                    if (tt.ticket_id === ticketId && typeof tt.quantity === "number") {
                        total += tt.quantity;
                    }
                });
            }
        });
        return total;
    }

    function handleBuyTicket() {
        const token = localStorage.getItem("tkn");
        if (!token) {
            alert("Please login first to buy tickets.");
            router.push("/login");
            return;
        }
        if (selectedTicket) {
            router.push(`/purchase?event=${event}&ticketId=${selectedTicket}&quantity=${quantity}`);
        }
    }

    if (!detailEvent) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Event Image */}
                        <div className="relative mb-6">
                            <Image
                                // src={detailEvent.image || "/placeholder.svg"}
                                src="https://images.unsplash.com/photo-1582711012124-a56cf82307a0"
                                alt={detailEvent.name}
                                width={600}
                                height={400}
                                className="w-full h-64 md:h-96 object-cover rounded-lg"
                                priority
                            />
                            <div className="absolute top-4 left-4">
                                <Badge className="text-sm">{detailEvent.category.name}</Badge>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button size="sm" variant="secondary">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="secondary">
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Event Info */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-4">{detailEvent.name}</h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-medium">
                                            {/* {new Date(detailEvent.start_date).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })} */}
                                            {
                                                (() => {
                                                    const dateStr = detailEvent.start_date?.slice(0, 10);
                                                    if (!dateStr) return "";
                                                    const [year, month, day] = dateStr.split("-");
                                                    const bulan = [
                                                        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                                                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                                                    ];
                                                    const hari = [
                                                        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
                                                    ];
                                                    const dateObj = new Date(`${dateStr}T00:00:00`);
                                                    return `${hari[dateObj.getDay()]}, ${day} ${bulan[parseInt(month, 10) - 1]} ${year}`;
                                                })()
                                            }
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {/* {new Date(detailEvent.start_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })} */}
                                            {detailEvent.start_date.substring(11, 16)} WIB
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-medium">{detailEvent.location}</div>
                                        <div className="text-sm text-muted-foreground">{detailEvent.city.name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Star className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-medium">{calculateAverageRating(detailEvent.Transactions)} Rating</div>
                                        <div className="text-sm text-muted-foreground">{detailEvent.Transactions.length} reviews</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-medium">{getTotalTicketsSold(detailEvent.Transactions)} Tickets Sold</div>
                                        <div className="text-sm text-muted-foreground">
                                            {detailEvent.Tickets.reduce((sum: number, t: any) => sum + t.kuota, 0) - getTotalTicketsSold(detailEvent.Transactions)} tickets left
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Organizer */}
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar>
                                    <AvatarImage src={detailEvent.image} />
                                    <AvatarFallback>JE</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium">{detailEvent.organizer.name}</div>
                                    {/* <div className="text-sm text-muted-foreground">
                                        {detailEvent.organizer.rating} ★ • {detailEvent.organizer.eventsCount} events
                                    </div> */}
                                </div>
                                <Button variant="outline" size="sm">
                                    Follow
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="about" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="about">About</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                            </TabsList>

                            <TabsContent value="about" className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">About This Event</h3>
                                    <p className="text-muted-foreground leading-relaxed">{detailEvent.deskripsi}</p>
                                </div>

                                {/* <div>
                                    <h3 className="text-xl font-semibold mb-3">Event Highlights</h3>
                                    <ul className="space-y-2">
                                        {detailEvent.highlights.map((highlight, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div> */}
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold">
                                        Reviews ({reviewEvent ? reviewEvent.Transactions.reduce((sum: number, t: any) => sum + (t.Reviews?.length || 0), 0) : 0})
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">
                                            {reviewEvent ? calculateAverageRating(reviewEvent.Transactions) : 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {reviewEvent && reviewEvent.Transactions.length > 0 ? (
                                        reviewEvent.Transactions.flatMap((transaction: any) =>
                                            transaction.Reviews.map((review: any) => (
                                                <Card key={review.review_id}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar>
                                                                <AvatarImage src={review.User?.profile_picture || "/placeholder.svg"} />
                                                                <AvatarFallback>
                                                                    {review.User?.name ? review.User.name[0] : "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium">
                                                                        {review.User?.name || `User ${review.user_id}`}
                                                                    </span>
                                                                    <div className="flex">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star
                                                                                key={i}
                                                                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {transaction.payment_deadline
                                                                            ? new Date(transaction.payment_deadline).toLocaleDateString("id-ID")
                                                                            : ""}
                                                                    </span>
                                                                </div>
                                                                <p className="text-muted-foreground">{review.komen}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )
                                    ) : (
                                        <div className="text-muted-foreground">Belum ada review.</div>
                                    )}
                                </div>
                            </TabsContent>

                            {/*<TabsContent value="gallery" className="space-y-6">
                                <h3 className="text-xl font-semibold">Event Gallery</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {detailEvent.gallery.map((image, index) => (
                                        <Image
                                            key={index}
                                            // src={image || "/placeholder.svg"}
                                            src="https://images.unsplash.com/photo-1582711012124-a56cf82307a0"
                                            alt={`Gallery image ${index + 1}`}
                                            width={400}
                                            height={300}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            </TabsContent> */}
                        </Tabs>
                    </div>

                    {/* Sidebar - Ticket Purchase */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5" />
                                    Select Tickets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {detailEvent.Tickets.map((ticket: any) => {
                                    const sold = getTicketsSoldFor(ticket.ticket_id, detailEvent.Transactions);
                                    const remaining = ticket.kuota - sold;
                                    return (
                                        <div
                                            key={ticket.ticket_id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors
                                                ${selectedTicket === ticket.ticket_id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                } ${remaining === 0 ? "opacity-50 cursor-not-allowed" : ""}
                                                active:scale-95`}
                                            onClick={() => remaining > 0 && setSelectedTicket(ticket.ticket_id)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-medium">{ticket.name}</div>
                                                <div className="text-right">
                                                    <div className="font-bold text-primary">Rp {ticket.harga.toLocaleString("id-ID")}</div>
                                                    {ticket.harga > ticket.harga && (
                                                        <div className="text-sm text-muted-foreground line-through">
                                                            Rp {ticket.harga.toLocaleString("id-ID")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">{ticket.deskripsi}</div>
                                            <div className="text-sm">
                                                {remaining > 0 ? (
                                                    <span className="text-green-600">
                                                        {remaining} tickets available ({sold} sold)
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600">Sold out</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                {selectedTicket && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Quantity</label>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => {
                                                    setQuantity(Math.max(1, quantity - 1))
                                                    if (quantity === 1) setSelectedTicket(null)
                                                }} className="cursor-pointer active:scale-95">
                                                    -
                                                </Button>
                                                <span className="w-12 text-center">{quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const ticket = detailEvent.Tickets.find((t: any) => t.ticket_id === selectedTicket);
                                                        const sold = getTicketsSoldFor(selectedTicket, detailEvent.Transactions);
                                                        const remaining = ticket.kuota - sold;
                                                        if (quantity < remaining) {
                                                            setQuantity(quantity + 1);
                                                        }
                                                    }}
                                                    className="cursor-pointer active:scale-95"
                                                    disabled={
                                                        (() => {
                                                            const ticket = detailEvent.Tickets.find((t: any) => t.ticket_id === selectedTicket);
                                                            const sold = getTicketsSoldFor(selectedTicket, detailEvent.Transactions);
                                                            const remaining = ticket.kuota - sold;
                                                            return quantity >= remaining;
                                                        })()
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            {(() => {
                                                const ticket = detailEvent.Tickets.find((t: any) => t.ticket_id === selectedTicket);
                                                const sold = getTicketsSoldFor(selectedTicket, detailEvent.Transactions);
                                                const remaining = ticket.kuota - sold;
                                                return quantity >= remaining ? (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Maksimal pembelian sesuai sisa tiket: {remaining}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>
                                                    Rp{" "}
                                                    {(
                                                        detailEvent.Tickets.find((t: any) => t.ticket_id === selectedTicket)!.harga * quantity
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Service fee</span>
                                                <span>Rp 5,000</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>
                                                    Rp{" "}
                                                    {(
                                                        detailEvent.Tickets.find((t: any) => t.ticket_id === selectedTicket)!.harga * quantity +
                                                        5000
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* <Button className="w-full" size="lg" onClick={handleBuyTicket}> */}
                                        <Button className="w-full cursor-pointer active:scale-95" size="lg" onClick={handleBuyTicket}>
                                            Buy Tickets
                                        </Button>
                                    </div>
                                )}

                                {/* {!selectedTicket && (
                                    <div className="text-center py-4 text-muted-foreground">Select a ticket type to continue</div>
                                )} */}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}