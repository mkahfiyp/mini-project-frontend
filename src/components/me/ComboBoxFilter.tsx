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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ComboBoxFilterProps {
    options: { id: string | number; label: string }[];
    selected: string;
    setSelected: (value: string) => void;
    placeholder?: string;
    allLabel?: string;
}

export function ComboBoxFilter({
    options,
    selected,
    setSelected,
    placeholder = "Select...",
    allLabel = "All",
}: ComboBoxFilterProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-[var(--color-primary-foreground)]"
                >
                    {selected !== "All"
                        ? options.find((opt) => opt.label === selected)?.label
                        : allLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                key="all"
                                value="All"
                                onSelect={() => {
                                    setSelected("All");
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selected === "All" ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {allLabel}
                            </CommandItem>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.id}
                                    value={opt.label}
                                    onSelect={(currentValue) => {
                                        setSelected(currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected === opt.label ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {opt.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}