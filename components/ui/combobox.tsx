"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxProps {
  options?: { label: string; value: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

interface ComboboxContext {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComboboxContext = React.createContext<ComboboxContext | undefined>(
  undefined
);

export function Combobox({
  value,
  onValueChange,
  open,
  onOpenChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  return (
    <ComboboxContext.Provider
      value={{
        value,
        onValueChange,
        open: isOpen,
        onOpenChange: setIsOpen,
      }}
    >
      {children}
    </ComboboxContext.Provider>
  );
}

export function ComboboxTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const context = React.useContext(ComboboxContext);
  if (!context) throw new Error("ComboboxTrigger must be used within Combobox");

  return (
    <Popover open={context.open} onOpenChange={context.onOpenChange}>
      <PopoverTrigger asChild>
        <div className={className}>{children}</div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function ComboboxInput({
  placeholder,
  onValueChange,
  className,
}: {
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const context = React.useContext(ComboboxContext);
  if (!context) throw new Error("ComboboxInput must be used within Combobox");

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={context.open}
        className="w-full justify-between"
      >
        {context.value || placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </div>
  );
}

export function ComboboxContent({ children }: { children: React.ReactNode }) {
  return (
    <Command className="w-full">
      <CommandGroup>{children}</CommandGroup>
    </Command>
  );
}

export function ComboboxItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(ComboboxContext);
  if (!context) throw new Error("ComboboxItem must be used within Combobox");

  return (
    <CommandItem
      value={value}
      onSelect={() => {
        context.onValueChange(value);
        context.onOpenChange(false);
      }}
      className={cn(
        "cursor-pointer",
        className
      )}
    >
      {children}
    </CommandItem>
  );
}