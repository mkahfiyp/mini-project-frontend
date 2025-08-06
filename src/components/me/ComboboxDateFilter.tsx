import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";

interface ComboBoxDateFilterProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export function ComboBoxDateFilter({ date, setDate }: ComboBoxDateFilterProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="center" style={{ minWidth: "var(--radix-popover-trigger-width)" }}>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                    }}
                    className="rounded-md border shadow-sm w-full"
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}