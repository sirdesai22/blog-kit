"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { countryOptions } from "@/modules/blogs/data/country-data";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CountrySelectProps {
  className?: string;
  defaultValue?: string;
}

export default function CountrySelect({
  className,
  defaultValue,
}: CountrySelectProps) {
  const [selectedCode, setSelectedCode] = useState<string | undefined>(
    defaultValue
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedCountry = countryOptions.find((c) => c.code === selectedCode);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) {
      return countryOptions;
    }
    return countryOptions.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <Select
      value={selectedCode}
      onValueChange={setSelectedCode}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <div className="flex items-center gap-2">
          {selectedCountry && (
            <Image
              src={`/flags/${selectedCountry.code.toLowerCase()}.svg`}
              alt={selectedCountry.name}
              width={20}
              height={15}
              className="object-contain"
            />
          )}
          <SelectValue placeholder="Select a country">
            {selectedCountry?.name}
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent
        position="popper"
        className={cn(
          "max-h-[300px] p-2 w-[95%]",

          "[&_[data-radix-select-scroll-button]]:hidden"
        )}
      >
        <Input
          placeholder="Search country..."
          className="mb-2 w-[95%]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="max-h-[220px] w-[95%] overflow-y-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <Image
                    src={`/flags/${country.code.toLowerCase()}.svg`}
                    alt={country.name}
                    width={20}
                    height={15}
                    className="object-contain"
                  />
                  <span>{country.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No countries found.
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  );
}
