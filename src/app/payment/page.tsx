"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { apiCall } from "@/helper/apiCall";
import { Building2, CheckCircle, Clock, Copy, CreditCard, Smartphone, Upload, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react"
import PaymentInstructions from "./components/PaymentInstructions";

export default function PaymentPage() {
    const [transaction, setTransaction] = useState<any>(null);
    const searchParams = useSearchParams();
    const transactionId = searchParams.get("transaction");
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pointUsed, setPointUsed] = useState(0);

    const getTransaction = async () => {
        const { data } = await apiCall.get(`/transaction/${transactionId}`);
        setTransaction(data)
        setPointUsed(data.used_point)
        console.log(data)
    }

    const uploadPaymentProof = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("img", file);

        const token = localStorage.getItem("tkn");
        await apiCall.patch(`/payment/${transaction.transaction_code}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        setLoading(false);
        getTransaction();
    }

    useEffect(() => {
        getTransaction();
    }, [])

    useEffect(() => {
        if (!transaction?.payment_deadline) return;

        const interval = setInterval(() => {
            const now = new Date();
            const deadline = new Date(transaction.payment_deadline);
            const diff = deadline.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Expired");
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [transaction?.payment_deadline]);

    // console.log(transaction);

    if (!transaction) {
        return <div>Loading...</div>;
    }

    const getPaymentMethodIcon = () => {
        switch (transaction.payment_method) {
            case "bank-transfer":
                return Building2
            case "e-wallet":
                return Smartphone
            default:
                return CreditCard
        }
    }
    const PaymentIcon = getPaymentMethodIcon()

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Instructions */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
                            <p className="text-muted-foreground">
                                Please complete your payment within the time limit to secure your tickets
                            </p>
                        </div>

                        {/* Payment Status */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <PaymentIcon className="h-5 w-5" />
                                        Payment Instructions
                                    </CardTitle>
                                    {transaction.payment_proof === null ? (
                                        timeLeft === "Expired" || timeLeft === "" ? (
                                            <Badge variant="outline" className="text-red-600 border-red-600">
                                                Payment Failed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                Pending Payment
                                            </Badge>
                                        )

                                    ) : (
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            Payment Submitted
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>Order ID: {transaction.orderId}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Bank Transfer Instructions */}
                                {transaction.payment_proof === null ? (
                                    timeLeft === "Expired" || timeLeft === "" ? (
                                        <div className="text-center py-8">
                                            <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                            <p className="text-sm font-medium text-red-600">Payment failed!</p>
                                        </div>
                                    ) : (
                                        <CardContent className="space-y-4">
                                            <PaymentInstructions paymentMethod={transaction.payment_method} transaction={transaction} />
                                        </CardContent>
                                    )
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                        <p className="text-sm font-medium text-green-600">Payment completed successfully!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upload Payment Proof */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Upload Payment Proof
                                </CardTitle>
                                <CardDescription>Upload a screenshot or photo of your transfer receipt</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {
                                    transaction.payment_proof === null ? (
                                        timeLeft === "Expired" || timeLeft === "" ? (
                                            <div className="text-center py-8">
                                                <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-red-600">Payment failed!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium">Upload your payment proof</p>
                                                        <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                                                    </div>
                                                    <Input type="file" accept="image/*,.pdf"
                                                        // onChange={handleFileUpload}
                                                        ref={fileInputRef}
                                                        className="mt-4"
                                                    />
                                                </div>

                                                {transaction.payment_proof !== null && (
                                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm font-medium">{transaction.name}</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm"
                                                        // onClick={() => setPaymentProof(null)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* <Button onClick={handleSubmitProof} disabled={!paymentProof} className="w-full"> */}
                                                {/* <Button disabled={!transaction.payment_proof} className="w-full">
                                                Submit Payment Proof
                                            </Button> */}
                                                <Button onClick={uploadPaymentProof} disabled={loading} className="w-full">
                                                    {loading ? "Uploading..." : "Submit Payment Proof"}
                                                </Button>
                                            </div>
                                        )

                                    ) : (
                                        <div className="text-center py-8">
                                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                            <p className="text-sm font-medium text-green-600">Payment proof uploaded successfully!</p>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Order ID: {transaction.transaction_id}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Event Details */}
                                <div>
                                    <h3 className="font-medium mb-2">{transaction.Event.name}</h3>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>
                                            {/* {new Date(transaction.Event.start_date).toLocaleDateString("id-ID", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })} */}
                                            {
                                                (() => {
                                                    const dateStr = transaction.Event.start_date?.slice(0, 10);
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
                                        <div>{transaction.Event.start_date.substring(11, 16)} WIB</div>
                                        <div>{transaction.Event.location}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Customer Details */}
                                <div>
                                    <h4 className="font-medium mb-2">Customer Details</h4>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div>{transaction.User.name}</div>
                                        <div>{transaction.User.email}</div>
                                        <div>{transaction.User.phone}</div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Ticket Details */}
                                <div>
                                    <h4 className="font-medium mb-2">Ticket Details</h4>
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            {transaction.Ticket.name} × {transaction.TransactionTickets[0].quantity}
                                        </span>
                                        <span>
                                            Rp {(transaction.Ticket.harga * transaction.TransactionTickets[0].quantity).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Service Fee</span>
                                        <span>Rp 5,000</span>
                                    </div>
                                    {/* Voucher Discount */}
                                    {transaction.Voucher && (
                                        <div className="flex justify-between text-green-600 text-sm">
                                            <span>Voucher Discount ({transaction.Voucher.code})</span>
                                            <span>
                                                - Rp {(() => {
                                                    const subtotal = transaction.Ticket.harga * transaction.TransactionTickets[0].quantity;
                                                    let discount = subtotal * (transaction.Voucher.discount_value / 100);
                                                    if (discount > transaction.Voucher.max_discount) {
                                                        discount = transaction.Voucher.max_discount;
                                                    }
                                                    return discount.toLocaleString("id-ID");
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {/* User Point */}
                                    {pointUsed > 0 && (
                                        <div className="flex justify-between text-blue-600 text-sm">
                                            <span>Point Used</span>
                                            <span>- Rp {pointUsed.toLocaleString("id-ID")}</span>
                                        </div>
                                    )}
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>
                                            Rp {(() => {
                                                const subtotal = transaction.Ticket.harga * transaction.TransactionTickets[0].quantity;
                                                let discount = 0;
                                                if (transaction.Voucher) {
                                                    discount = subtotal * (transaction.Voucher.discount_value / 100);
                                                    if (discount > transaction.Voucher.max_discount) {
                                                        discount = transaction.Voucher.max_discount;
                                                    }
                                                }
                                                return (subtotal + 5000 - discount - pointUsed).toLocaleString("id-ID");
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Payment Expiry */}
                                {
                                    timeLeft === "Expired" || timeLeft === "" ? (
                                        transaction.payment_proof === null ? (
                                            // <CardContent className="space-y-4">
                                            //     <PaymentInstructions paymentMethod={transaction.payment_method} transaction={transaction} />
                                            // </CardContent>
                                            <div className="text-center">
                                                <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-red-600">Payment failed!</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-green-600">Payment completed successfully!</p>
                                            </div>
                                        )
                                    ) : (
                                        transaction.payment_proof === null ? (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-orange-600" />
                                                    <span className="font-medium text-orange-800">Payment Expires In</span>
                                                </div>
                                                <div className="text-lg font-bold text-orange-600 mt-1">{timeLeft}</div>
                                                <p className="text-xs text-orange-700 mt-1">Complete payment before expiry to secure your tickets</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                                <p className="text-sm font-medium text-green-600">Payment completed successfully!</p>
                                            </div>
                                        )
                                    )
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}