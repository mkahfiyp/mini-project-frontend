"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

type ComboboxItem = {
    value: string;
    label: string;
};

type ComboboxProps = {
    value: string;
    onChange: (val: string) => void;
    items: ComboboxItem[];
    placeholder?: string;
    searchPlaceholder?: string;
    label?: string;
    className?: string;
};

export function Combobox({
    value,
    onChange,
    items,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    label,
    className,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={className}>
            {label && <span className="block mb-1 font-medium">{label}</span>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value
                            ? items.find((item) => item.value === value)?.label
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} className="h-9" />
                        <CommandList>
                            <CommandEmpty>No option found.</CommandEmpty>
                            <CommandGroup>
                                {items.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        {item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}