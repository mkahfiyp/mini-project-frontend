import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function EventList({ dataEvent }: { dataEvent: any[] }) {
    if (!dataEvent || dataEvent.length === 0) {
        return <p>No events found.</p>;
    }
    return (
        <div className="grid grid-cols-1 gap-4">
            {dataEvent.map((event: any) => {
                const startDate = new Date(event.start_date).toLocaleString("id-ID", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                });
                const endDate = new Date(event.end_date).toLocaleString("id-ID", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
                });
                return (
                    <Card key={event.event_ID} className="w-full">
                        <CardHeader>
                            <CardTitle>{event.name}</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {event.category?.name} &middot; {event.city?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {event.location}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {startDate} - {endDate}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Image
                                src={"https://images.unsplash.com/photo-1582711012124-a56cf82307a0"}
                                width={600}
                                height={400}
                                alt={event.name}
                                className="mb-2 rounded w-full h-32 object-cover"
                            />
                            <p className="mb-2">{event.deskripsi}</p>
                            <p className="font-semibold">Price: Rp{event.price.toLocaleString()}</p>
                            {event.Tickets && event.Tickets.length > 0 && (
                                <div className="mt-2">
                                    <span className="font-medium">Tickets:</span>
                                    <ul className="list-disc ml-5">
                                        {event.Tickets.map((ticket: any) => (
                                            <li key={ticket.ticket_id}>
                                                {ticket.name} ({ticket.kategori}) - Rp{ticket.harga.toLocaleString()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}