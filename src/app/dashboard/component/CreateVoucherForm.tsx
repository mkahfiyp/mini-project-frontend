import { Combobox } from "@/components/me/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiCall } from "@/helper/apiCall";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
    event_id: string;
    code: string;
    discount_value: string;
    min_purchase: string;
    max_discount: string;
    start_date: string;
    end_date: string;
}

export default function CreateVoucherForm({ events, onSuccess }: { events: { event_ID: number, name: string }[], onSuccess?: () => void }) {
    const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            event_id: "",
            code: "",
            discount_value: "",
            min_purchase: "",
            max_discount: "",
            start_date: "",
            end_date: "",
        }
    })
    const [message, setMessage] = useState("");

    const handleComboboxChange = (val: string, field: keyof FormValues) => {
        setValue(field, val);
    }

    const onSubmit = async (data: FormValues) => {
        setMessage("");
        try {
            const token = localStorage.getItem("tkn");
            await apiCall.post("/voucher", {
                event_id: Number(data.event_id),
                code: data.code,
                discount_value: Number(data.discount_value),
                min_purchase: Number(data.min_purchase),
                max_discount: Number(data.max_discount),
                start_date: data.start_date,
                end_date: data.end_date,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage("Failed to create voucher");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Voucher</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Combobox
                            value={watch("event_id")}
                            onChange={(val) => handleComboboxChange(val, "event_id")}
                            items={events.map((val) => ({
                                value: String(val.event_ID),
                                label: val.name,
                            }))}
                            placeholder="Select Event"
                            label="Event"
                        />
                        {errors.event_id && <span className="text-red-500 text-xs">Event wajib dipilih</span>}
                    </div>
                    <div>
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" {...register("code", { required: true })} />
                        {errors.code && <span className="text-red-500 text-xs">Code wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="discount_value">Discount Value</Label>
                        <Input id="discount_value" type="number" min={0} {...register("discount_value", { required: true, min: 0 })} />
                        {errors.discount_value && <span className="text-red-500 text-xs">Discount value wajib diisi & tidak boleh minus</span>}
                    </div>
                    <div>
                        <Label htmlFor="min_purchase">Min Purchase</Label>
                        <Input id="min_purchase" type="number" min={0} {...register("min_purchase", { required: true, min: 0 })} />
                        {errors.min_purchase && <span className="text-red-500 text-xs">Min purchase wajib diisi & tidak boleh minus</span>}
                    </div>
                    <div>
                        <Label htmlFor="max_discount">Max Discount</Label>
                        <Input id="max_discount" type="number" min={0} {...register("max_discount", { required: true, min: 0 })} />
                        {errors.max_discount && <span className="text-red-500 text-xs">Max discount wajib diisi & tidak boleh minus</span>}
                    </div>
                    <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" type="datetime-local" {...register("start_date", { required: true })} />
                        {errors.start_date && <span className="text-red-500 text-xs">Start date wajib diisi</span>}
                    </div>
                    <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" type="datetime-local" {...register("end_date", { required: true })} />
                        {errors.end_date && <span className="text-red-500 text-xs">End date wajib diisi</span>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Voucher"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}