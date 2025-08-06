"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiCall } from "@/helper/apiCall";
import { CheckCircle, MessageSquare, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ReviewPage() {
    const router = useRouter();
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState("")
    const [reviewSubmitted, setReviewSubmitted] = useState(false)
    const searchParams = useSearchParams()
    const transaction_code = searchParams.get("transaction")

    const handleRatingClick = (value: number) => {
        setRating(value)
    }

    const handleSubmitReview = async () => {
        if (rating > 0 && transaction_code) {
            setReviewSubmitted(true)
            // In real app, submit to API
            const token = localStorage.getItem("tkn")
            const { data } = await apiCall.post(`/review?transaction=${transaction_code}`, {
                rating: rating,
                komen: review,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTimeout(() => {
                router.push("/transactions")
            }, 2000)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Review Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Rate Your Experience
                    </CardTitle>
                    <CardDescription>Help others by sharing your thoughts about this event</CardDescription>
                </CardHeader>
                <CardContent>
                    {!reviewSubmitted ? (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium mb-2 block">How would you rate this event?</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button key={value} onClick={() => handleRatingClick(value)} className="p-1">
                                            <Star
                                                className={`h-6 w-6 ${value <= rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted-foreground hover:text-yellow-400"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="review" className="text-sm font-medium mb-2 block">
                                    Write a review (optional)
                                </Label>
                                <Textarea
                                    id="review"
                                    placeholder="Share your experience with other event-goers..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button onClick={handleSubmitReview} disabled={rating === 0} className="w-full">
                                Submit Review
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                            <h3 className="font-medium text-green-600 mb-1">Thank you for your review!</h3>
                            <p className="text-sm text-muted-foreground">Your feedback helps us improve our events</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}