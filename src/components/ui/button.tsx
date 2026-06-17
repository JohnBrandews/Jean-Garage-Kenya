import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-body text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-charcoal text-white hover:bg-gold px-8 py-4",
        secondary:
          "border border-charcoal bg-transparent text-charcoal hover:border-gold hover:text-gold px-8 py-4",
        gold:
          "gold-gradient text-white px-8 py-4 hover:opacity-90",
        ghost:
          "border border-gold bg-transparent text-gold hover:bg-gold hover:text-white px-8 py-4",
        outline:
          "border border-white/70 bg-transparent text-white hover:bg-white hover:text-charcoal px-8 py-4",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-6 text-xs",
        lg: "h-14 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
