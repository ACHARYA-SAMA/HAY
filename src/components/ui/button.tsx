import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Link, type LinkProps } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
export const buttonVariants=cva("clicky",{variants:{variant:{default:"clicky--primary clicky--ink",outline:"",ghost:"clicky--ghost",secondary:"clicky--secondary"},size:{default:"",sm:"clicky--sm",lg:"clicky--lg",icon:"clicky--icon"}},defaultVariants:{variant:"default",size:"default"}});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{asChild?:boolean}
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant,size,asChild=false,children,disabled,onClick,onClickCapture,...props},ref)=>{
  const busy=props["aria-busy"]===true||props["aria-busy"]==="true";
  const blocked=!!disabled||busy||props["aria-disabled"]===true||props["aria-disabled"]==="true";
  const Comp=asChild?Slot:"button";
  const content=busy?(asChild&&React.isValidElement(children)?React.cloneElement(children as React.ReactElement<{children?:React.ReactNode}>,{},"PRINTING"):"PRINTING"):children;
  return <Comp {...props} ref={ref} className={cn(buttonVariants({variant,size}),className)} {...(!asChild?{disabled:disabled||busy}:{})} aria-disabled={blocked||props["aria-disabled"]} onClickCapture={event=>{if(blocked){event.preventDefault();event.stopPropagation();return}onClickCapture?.(event)}} onClick={event=>{if(blocked){event.preventDefault();event.stopPropagation();return}onClick?.(event)}}>{content}</Comp>;
});
Button.displayName="Button";
export function ButtonLink({className,...props}:LinkProps & {className?:string;children:React.ReactNode}){return <Link className={cn(buttonVariants(),className)} {...props}/>}
