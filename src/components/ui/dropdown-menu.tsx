import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}>({
  isOpen: false,
  setIsOpen: () => {},
  triggerRef: { current: null },
  contentRef: { current: null },
});

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // wrapper for trigger
  const triggerRef = dropdownRef;
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider
      value={{ isOpen, setIsOpen, triggerRef, contentRef }}
    >
      <div className="inline-block" ref={dropdownRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return <div onClick={handleClick}>{children}</div>;
}

export function DropdownMenuContent({
  align = "start",
  className = "",
  children,
}: DropdownMenuContentProps) {
  const { isOpen, triggerRef, contentRef } =
    React.useContext(DropdownMenuContext);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    triggerWidth: 0,
  });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      triggerWidth: rect.width,
    });
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        triggerWidth: rect.width,
      });
    };
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  let computedLeft = coords.left;
  const style: React.CSSProperties = {
    position: "absolute",
    top: coords.top,
    zIndex: 9999,
  };
  if (align === "end" && contentRef.current) {
    computedLeft =
      coords.left + coords.triggerWidth - contentRef.current.offsetWidth;
  } else if (align === "center" && contentRef.current) {
    computedLeft =
      coords.left +
      coords.triggerWidth / 2 -
      contentRef.current.offsetWidth / 2;
  }
  style.left = Math.max(8, computedLeft);
  if (align === "center" && !contentRef.current) {
    style.transform = "translateX(-50%)"; // provisional until ref measured
  }

  const menu = (
    <div
      ref={contentRef}
      className={`min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md ${className}`}
      style={style}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
}

export function DropdownMenuItem({
  onClick,
  className = "",
  children,
}: DropdownMenuItemProps) {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}
