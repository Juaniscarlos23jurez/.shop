"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Category } from "@/types/category";
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

type ValueKey = "id" | "slug";

interface CategorySelectProps {
  categories: Category[];
  name: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  valueKey?: ValueKey;
  className?: string;
  triggerClassName?: string;
}

export function CategorySelect({
  categories,
  name,
  placeholder = "Selecciona una categoría",
  disabled,
  required,
  value,
  defaultValue,
  onChange,
  valueKey = "id",
  className,
  triggerClassName,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  useEffect(() => {
    setInternalValue(defaultValue ?? "");
  }, [defaultValue]);

  const currentValue = value ?? internalValue;

  const sortedCategories = useMemo(() => {
    return [...categories]
      .filter((cat) => cat.is_active)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return sortedCategories;
    const term = searchTerm.toLowerCase();
    return sortedCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        cat.slug.toLowerCase().includes(term)
    );
  }, [sortedCategories, searchTerm]);

  const getValue = (cat: Category) =>
    valueKey === "slug" ? cat.slug : String(cat.id);

  const selectedCategory = sortedCategories.find(
    (cat) => getValue(cat) === currentValue
  );

  const handleSelect = (newValue: string) => {
    if (!value) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="hidden"
        name={name}
        value={currentValue}
        required={required}
        readOnly
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal",
              !currentValue && "text-muted-foreground",
              triggerClassName
            )}
          >
            {selectedCategory ? selectedCategory.name : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Buscar categoría..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                autoFocus
              />
            </div>
            <CommandList>
              <CommandEmpty>No se encontraron categorías.</CommandEmpty>
              <CommandGroup>
                {filteredCategories.map((category) => {
                  const optionValue = getValue(category);
                  const isSelected = optionValue === currentValue;
                  return (
                    <CommandItem
                      key={optionValue}
                      value={optionValue}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
