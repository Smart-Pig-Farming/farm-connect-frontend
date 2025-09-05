import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select component");
  }
  return context;
};

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSelectContext();

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const isSelected = selectedValue === value;

    const handleClick = () => {
      if (!disabled && onValueChange) {
        onValueChange(value);
        setOpen(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { value } = useSelectContext();

    return (
      <span ref={ref} className={cn(className)} {...props}>
        {value || placeholder}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
