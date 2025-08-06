"use client"
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Search, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { apiCall } from "@/helper/apiCall";
import { ComboBoxFilter } from "@/components/me/ComboBoxFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ComboBoxDateFilter } from "@/components/me/ComboboxDateFilter";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const dataSortBy = [
    { id: "date", label: "Date" },
    { id: "price-low", label: "Price Low" },
    { id: "price-high", label: "Price High" },
    { id: "rating", label: "Rating" },
    { id: "popularity", label: "Popularity" },
]

export default function EventPage() {
    const router = useRouter()

    const [categories, setCategories] = useState<any[]>([])
    const [city, setCity] = useState<any[]>([])
    const [event, setEvent] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(6)
    const [totalPages, setTotalPages] = useState(1)

    const [searchTerm, setSearchTerm] = useState("")
    const [debounceValue] = useDebounce(searchTerm, 3000)
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedCity, setSeletedCity] = useState("All")
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [selectedSortBy, setSelectedSortBy] = useState("Date")

    const getEvents = async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (selectedCategory !== "All") params.append("category_name", selectedCategory.toString());
            if (selectedCity !== "All") params.append("city_name", selectedCity.toString());
            if (debounceValue) params.append("name", debounceValue);
            // if (date) params.append("start_date", date.toISOString().split("T")[0]);
            if (date) params.append("start_date", date?.toLocaleDateString("en-CA"));
            if (selectedSortBy) params.append("sort_by", selectedSortBy);

            const { data } = await apiCall.get(`/event?${params.toString()}`);
            router.replace(`/events?${params.toString()}`)
            setEvent(data.data);
            if (data.data.length === 0) {
                setPage(0)
                setTotalPages(0)
            } else {
                setPage(data.page)
                setTotalPages(data.totalPages)
            }
            setLimit(data.limit)
            // console.log(event)
        } catch (error) {
            console.log(error);
        }
    };

    const getCategories = async () => {
        try {
            const { data } = await apiCall.get("/category")
            const convertData = data.map((val: any) => ({
                id: val.category_id,
                label: val.name,
            }));
            setCategories(convertData)
        } catch (error) {
            console.log(error)
        }
    }

    const getCity = async () => {
        try {
            const { data } = await apiCall.get("/event")
            const eventList = data.data
            const cityList = Array.from(
                new Map(
                    eventList.map((event: any) => [
                        event.city.city_id,
                        { id: event.city.city_id, label: event.city.name }
                    ])
                ).values()
            )
            setCity(cityList)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const category = params.get("category_name")
        const city = params.get("city_name")
        const date = params.get("start_date")
        const sortBy = params.get("sort_by")
        if (category) {
            setSelectedCategory(category)
        }
        if (city) {
            setSeletedCity(city)
        }
        if (date) {
            setDate(new Date(`${date}`))
        }
        if (sortBy) {
            setSelectedSortBy(sortBy)
        }

        const name = params.get("name")
        if (name) {
            setSearchTerm(name)
        }

        getCategories()
        getCity()
    }, [])

    useEffect(() => {
        // handleFilterChange()
        getEvents()
    }, [page, limit, selectedCategory, selectedCity, debounceValue, date, selectedSortBy])

    // const handleFilterChange = () => {
    //     const params = new URLSearchParams();

    //     if (selectedCategory !== "All") params.append("category_name", encodeURIComponent(selectedCategory))
    //     if (selectedCity !== "All") params.append("city_name", encodeURIComponent(selectedCity))
    //     if (searchTerm) params.append("name", encodeURIComponent(searchTerm))
    //     if (date) params.append("start_date", date.toISOString().split("T")[0])

    //     router.push(`/events?${params.toString()}`);
    // }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Cari Event Seru</h1>
                <p className="text-muted-foreground">Lihat berbagai acara menarik di sekitarmu</p>
            </div>

            {/* Filters */}
            <div className="bg-muted/50 outline rounded-lg p-6 mb-8 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/4 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[var(--color-background)]"
                        />
                    </div>

                    {/* Combobox Category */}
                    <ComboBoxFilter
                        options={categories}
                        selected={selectedCategory}
                        setSelected={setSelectedCategory}
                        placeholder="Category"
                        allLabel="All Category"
                    />

                    {/* Combobox City */}
                    <ComboBoxFilter
                        options={city}
                        selected={selectedCity}
                        setSelected={setSeletedCity}
                        placeholder="City"
                        allLabel="All City"
                    />

                    {/* Combobox Time Filter */}
                    <ComboBoxDateFilter date={date} setDate={setDate} />

                    {/* Combobox Sort By */}
                    <Select
                        value={selectedSortBy}
                        onValueChange={setSelectedSortBy}
                    >
                        <SelectTrigger className="w-full bg-[var(--color-primary-foreground)]">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Sort By</SelectLabel>
                                {
                                    dataSortBy.map((val) =>
                                        <SelectItem key={val.id} value={val.label}>{val.label}</SelectItem>
                                    )
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end">
                    <Button className="cursor-pointer active:scale-95" variant="link"
                        onClick={() => {
                            setSearchTerm("")
                            setSelectedCategory("All")
                            setSeletedCity("All")
                            setDate(undefined)
                        }}>
                        Reset Filter
                    </Button>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mb-8 gap-2">
                <Button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    variant="outline"
                >
                    Previous
                </Button>
                <span className="px-4 py-2">{page} / {totalPages}</span>
                <Button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                >
                    Next
                </Button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {event.map((event) => (
                    <Link key={event.event_ID} href={`/events/detail/${event.name}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full pt-0">
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
                                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4" />
                                        {/* {new Date(event.start_date).toLocaleDateString("id-ID", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })} */}
                                        {/* {
                                            new Date(event.start_date).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                        } */}
                                        {
                                            (() => {
                                                const dateStr = event.start_date?.slice(0, 10);
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
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4" />
                                        {event.location}, {event.city.name}
                                    </div>
                                </div>
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
                                                    const reviews = event.Transactions?.flatMap((trx: any) => trx.Reviews ?? []) ?? [];
                                                    const avgRating = reviews.length > 0
                                                        ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
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
    )
}