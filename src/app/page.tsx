"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiCall } from "@/helper/apiCall";
import { Calendar, MapPin, Search, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const router = useRouter()

  const [categories, setCategories] = useState<any[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([])
  const [limit, setLimit] = useState(3)
  const searchRef = useRef<HTMLInputElement>(null)

  const getCategories = async () => {
    try {
      const { data } = await apiCall.get("/category")
      setCategories(data)
    } catch (error) {
      console.log(error)
    }
  }

  const getEvents = async () => {
    try {
      // const { data } = await apiCall.get("/event")
      const { data } = await apiCall.get(`/event?limit=${limit}`)
      // console.log(data)
      setFeaturedEvents(data.data)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCategories();
    getEvents();
  }, [])

  return (
    // <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="">
        <div className="relative container mx-auto px-[10%] py-20 text-center bg-[url(https://images.unsplash.com/photo-1619229665486-19f7ee2987a5)] bg-no-repeat bg-cover bg-center rounded-xl">
          <div className="w-full inline-block px-8 py-4 mb-6 rounded-xl shadow-lg bg-black/70">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white">
              Temukan Acara Seru Buat Kamu!
            </h1>

            <p className="text-xl mb-8 max-w-2xl mx-auto text-[var(--color-secondary)]">
              Mulai dari konser, festival, sampai event komunitas — semuanya gampang dicari dan dipesan di sini.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search events, artists, venues..." className="pl-10 h-12 bg-[var(--color-background)]" ref={searchRef} />
                </div>
                <Button
                  size="lg"
                  className="h-12 px-8 cursor-pointer active:scale-95 active:shadow-inner"
                  onClick={() => {
                    const value = searchRef.current?.value || "";
                    router.push(`/events?name=${encodeURIComponent(value)}`);
                  }}
                >
                  Search Events
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Link href={`/events?category_name=${encodeURIComponent(category.name)}`} key={category.category_id} className="active:scale-95">
                  <Badge
                    variant="secondary"
                    className="text-sm py-2 px-4 hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  >
                    {category.icon} {category.name} ({category.Events.length})
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events">
              <Button variant="outline" className="cursor-pointer active:scale-95">View All Events</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents
              .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
              .slice(0, 3)
              .map((event) => (
                <Link key={event.event_ID} href={`/events/detail/${event.name}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer pt-0 active:scale-95">
                    <div className="relative">
                      <Image
                        src="https://images.unsplash.com/photo-1582711012124-a56cf82307a0"
                        alt={event.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                        priority
                      />
                      <Badge className="absolute top-2 left-2">{event.category.name}</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.start_date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}, {event.city.name}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">Rp {event.price.toLocaleString("id-ID")}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {/* {event.rating} */}
                            {
                              (() => {
                                const reviews = event.Transactions?.flatMap(
                                  (trx: any) => trx.Reviews ?? []
                                ) ?? [];
                                const avgRating =
                                  reviews.length > 0
                                    ? (
                                      reviews.reduce(
                                        (sum: number, review: any) => sum + review.rating,
                                        0
                                      ) / reviews.length
                                    ).toFixed(1)
                                    : "-";
                                return avgRating;
                              })()
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.Tickets?.reduce((sum: number, ticket: { kuota: number }) => sum + ticket.kuota, 0) || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
