import * as React from "react"

import { cn } from "@/lib/utils"

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "container px-4 md:px-6",
        className
      )}
      {...props}
    />
  )
})
Container.displayName = "Container"

export { Container }