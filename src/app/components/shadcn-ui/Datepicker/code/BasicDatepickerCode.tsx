import React from 'react'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/shadcn-ui/Default-Ui/button"
import { Calendar } from "@/app/components/shadcn-ui/Default-Ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/shadcn-ui/Default-Ui/popover"

const BasicDatepickerCode = () => {
    const [date, setDate] = React.useState<Date>()
  return (
    <>
    <div className="flex flex-wrap items-center gap-3 mt-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "max-w-sm justify-start text-left font-normal group",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary group-hover:text-white" />
                            {date ? format(date, "PPP") : <span className='text-primary group-hover:text-white' >Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
    </>
  )
}

export default BasicDatepickerCode