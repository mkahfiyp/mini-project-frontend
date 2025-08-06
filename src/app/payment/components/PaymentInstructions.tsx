import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";

function PaymentInstructions({ paymentMethod, transaction }: { paymentMethod: string, transaction: any }) {
    const subtotal = transaction.Ticket.harga * transaction.TransactionTickets[0].quantity;
    let discount = 0;
    if (transaction.Voucher) {
        discount = subtotal * (transaction.Voucher.discount_value / 100);
        if (discount > transaction.Voucher.max_discount) {
            discount = transaction.Voucher.max_discount;
        }
    }
    const total = subtotal + 5000 - discount;

    if (paymentMethod === "credit-card") {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Credit Card Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Enter your credit/debit card details on the next page</li>
                        <li>Follow the secure payment process</li>
                        <li>Wait for confirmation (instant)</li>
                    </ol>
                </div>
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentMethod === "bank-transfer") {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Bank Transfer Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Transfer the exact amount to the account below</li>
                        <li>Use your Order ID as the transfer reference</li>
                        <li>Upload your payment proof below</li>
                        <li>Wait for confirmation (usually within 1-2 hours)</li>
                    </ol>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm font-medium">Bank Name</Label>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span className="font-medium">Bank Central Asia (BCA)</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Account Number</Label>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span className="font-mono">1234567890</span>
                                <Button variant="ghost" size="sm">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm font-medium">Account Name</Label>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span className="font-medium">PT Event Indonesia</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Transfer Amount</Label>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <span>Rp {total.toLocaleString("id-ID")}</span>
                                <Button variant="ghost" size="sm">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentMethod === "e-wallet") {
        return (
            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">E-Wallet Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Scan the QR code below using your e-wallet app</li>
                        <li>Enter the exact amount</li>
                        <li>Use your Order ID as the payment reference</li>
                        <li>Wait for confirmation (instant)</li>
                    </ol>
                </div>
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">QR Code</Label>
                        <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                            {/* Replace with actual QR code */}
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/1200px-QR_Code_Example.svg.png" alt="QR Code" className="h-24 w-24" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default PaymentInstructions;

{/* <CardContent className="space-y-4">
    <PaymentInstructions paymentMethod={transaction.payment_method} transaction={transaction} />
</CardContent> */}
