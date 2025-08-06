"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { apiCall } from "@/helper/apiCall";
import { useUserStore } from "@/lib/zustand/userStore";
import { Building2, CreditCard, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import { UserProfileFetcher } from "@/helper/fetchUserProfile";

const paymentMethods = [
    {
        id: "credit-card",
        name: "Credit/Debit Card",
        icon: CreditCard,
        description: "Visa, Mastercard, JCB",
    },
    {
        id: "bank-transfer",
        name: "Bank Transfer",
        icon: Building2,
        description: "BCA, Mandiri, BNI, BRI",
    },
    {
        id: "e-wallet",
        name: "E-Wallet",
        icon: Smartphone,
        description: "GoPay, OVO, DANA, ShopeePay",
    },
]

export default function PurchasePage() {
    const router = useRouter();
    const params = useSearchParams();
    const paramEvent = params.get("event");
    const paramTicketId = params.get("ticketId");
    const paramQuantity = params.get("quantity");
    const [event, setEvent] = useState<any>(null)
    const [ticket, setTicket] = useState<any>(null)
    const [voucher, setVoucher] = useState<any>(null)
    const [discount, setDiscount] = useState(0)
    const serviceFee = 5000
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        // agreeTerms: false,
    })
    const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone
    const [selectedPayment, setSelectedPayment] = useState("credit-card");
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

    const voucherRef = useRef<HTMLInputElement>(null);

    const userPoint = useUserStore((state) => state.point);
    const [usePoint, setUsePoint] = useState(false);
    const [pointUsed, setPointUsed] = useState(0);
    const setUsername = useUserStore((state) => state.setUsername);
    const setPoint = useUserStore((state) => state.setPoint);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const getEvent = async () => {
        const { data } = await apiCall.get("/event/purchase/getByNamePurchase", {
            params: { name: paramEvent }
        })
        setEvent(data)
        // console.log(data)
    }

    const getTicket = async () => {
        const { data } = await apiCall.get(`/ticket/${paramTicketId}`)
        // console.log(data)
        setTicket(data)
    }

    const getVoucher = async () => {
        const { data } = await apiCall.get("/voucher")
        setVoucher(data)
        // console.log(data)
    }

    const fetchDataUser = async () => {
        const userFetcher = new UserProfileFetcher();
        await userFetcher.fetch(setUsername, setPoint);
    }

    useEffect(() => {
        getEvent()
        getTicket()
        getVoucher()
        fetchDataUser()
    }, [])

    if (!event || !ticket || !voucher) {
        return <div>Loading...</div>;
    }

    const jamMenit = event.start_date.substring(11, 16)

    const handleCheckVoucher = () => {
        setStatus("checking");

        setTimeout(() => {
            const VoucherInput = voucherRef.current?.value
            if (!VoucherInput) {
                setStatus("idle")
                return
            };

            const found = voucher.find((val: any) => val.code.toUpperCase() === VoucherInput.toUpperCase() && val.start_date <= new Date().toISOString() && val.end_date >= new Date().toISOString() && val.event_id === event.event_ID)

            if (found) {
                setStatus("valid")
                // setDiscount(found.discount_value)
                if (found.min_purchase <= ticket.harga * Number(paramQuantity)) {

                    const discountAmount = (ticket.harga * Number(paramQuantity)) * (found.discount_value / 100)
                    if (discountAmount > found.max_discount) {
                        setDiscount(found.max_discount)
                        setSelectedVoucher(found.voucher_id)
                        return
                    }
                    setDiscount(discountAmount)
                }
            } else {
                setStatus("invalid")
            }
        }, 1000);
    }

    const totalPembayaran = ticket.harga * Number(paramQuantity) + serviceFee - discount - pointUsed;

    const handleBuyTicket = async () => {
        const token = localStorage.getItem("tkn");
        const { data } = await apiCall.post("/transaction", {
            event_id: event.event_ID,
            ticket_id: Number(paramTicketId),
            voucher_id: selectedVoucher || null,
            quantity: Number(paramQuantity),
            total_price: totalPembayaran,
            payment_method: selectedPayment,
            used_point: usePoint ? pointUsed : 0
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        fetchDataUser()
        router.push(`/payment?transaction=${data.data.transaction_code}`);
    }
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
                            <p className="text-muted-foreground">Please fill in your details to complete the ticket purchase</p>
                        </div>

                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>This information will be used for your ticket and receipt</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            placeholder="Enter your first name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            placeholder="Enter your last name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>Choose your preferred payment method</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                                    {paymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                                            <RadioGroupItem value={method.id} id={method.id} />
                                            <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                                                <method.icon className="h-5 w-5" />
                                                <div>
                                                    <div className="font-medium">{method.name}</div>
                                                    <div className="text-sm text-muted-foreground">{method.description}</div>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Voucher */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Voucher</CardTitle>
                                <CardDescription>Please enter your voucher code below.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Label htmlFor="voucher">Voucher Code</Label>
                                <Input
                                    id="voucher"
                                    ref={voucherRef}
                                    placeholder="e.g., VCHR2025"
                                />
                                <Button onClick={handleCheckVoucher}>Check Voucher</Button>

                                {/* Status Message */}
                                {status === "checking" && <p className="text-sm text-gray-500">Checking voucher...</p>}
                                {status === "valid" && <p className="text-sm text-green-600">Voucher is valid!</p>}
                                {status === "invalid" && <p className="text-sm text-red-600">Invalid voucher code.</p>}
                            </CardContent>
                        </Card>

                        {/* Section Point */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Point</CardTitle>
                                <CardDescription>
                                    Kamu punya <span className="font-bold">{userPoint}</span> point.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="usePoint"
                                        checked={usePoint}
                                        onChange={(e) => {
                                            setUsePoint(e.target.checked);
                                            if (e.target.checked) {
                                                const maxPoint = Math.min(userPoint, ticket.harga * Number(paramQuantity) + serviceFee - discount);
                                                setPointUsed(maxPoint);
                                            } else {
                                                setPointUsed(0);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="usePoint">Gunakan point untuk potongan pembayaran</Label>
                                </div>
                                {usePoint && (
                                    <div>
                                        <Label htmlFor="pointUsed">Point yang digunakan</Label>
                                        <Input
                                            id="pointUsed"
                                            type="number"
                                            min={0}
                                            max={Math.min(userPoint, ticket.harga * Number(paramQuantity) + serviceFee - discount)}
                                            value={pointUsed}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPointUsed(
                                                    Math.max(
                                                        0,
                                                        Math.min(val, userPoint, ticket.harga * Number(paramQuantity) + serviceFee - discount)
                                                    )
                                                );
                                            }}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Maksimal: {Math.min(userPoint, ticket.harga * Number(paramQuantity) + serviceFee - discount)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* <Button type="button" size="lg" className="w-full" disabled={!isFormValid} onClick={handleSubmit}> */}
                        <Button type="button" size="lg" className="w-full" disabled={!isFormValid} onClick={handleBuyTicket}>
                            Proceed to Payment
                        </Button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Event Details */}
                                <div className="flex gap-3">
                                    <img
                                        src={"https://images.unsplash.com/photo-1582711012124-a56cf82307a0"}
                                        alt={event.name}
                                        width={80}
                                        height={60}
                                        className="rounded object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-medium line-clamp-2">{event.name}</h3>
                                        <div className="text-sm text-muted-foreground">
                                            {/* {new Date(event.start_date).toLocaleDateString("id-ID", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}{" "}
                                            • {jamMenit} */}
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
                                            <br />
                                            {event.start_date.substring(11, 16)} WIB
                                        </div>
                                        <div className="text-sm text-muted-foreground">{event.location}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Ticket Details */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>{ticket.name} Ticket</span>
                                        <span>Rp {ticket.harga.toLocaleString("id-ID")}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Quantity: {paramQuantity}</span>
                                        <span>Rp {(ticket.harga * Number(paramQuantity)).toLocaleString("id-ID")}</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Price Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Rp {(ticket.harga * Number(paramQuantity)).toLocaleString("id-ID")}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Voucher Discount</span>
                                            <span>- Rp {discount.toLocaleString("id-ID")}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Service Fee</span>
                                        <span>Rp {serviceFee.toLocaleString("id-ID")}</span>
                                    </div>
                                    {pointUsed > 0 && (
                                        <div className="flex justify-between text-blue-600">
                                            <span>Point Used</span>
                                            <span>- Rp {pointUsed.toLocaleString("id-ID")}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>Rp {totalPembayaran.toLocaleString("id-ID")}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}