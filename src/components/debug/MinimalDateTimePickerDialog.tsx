"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Using shadcn/ui Input for consistent styling wrapper
import { Label } from "@/components/ui/label";

export function MinimalDateTimePickerDialog() {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedTime, setSelectedTime] = React.useState<string>(
    format(new Date(), "HH:mm")
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getCombinedDateTime = (): Date | null => {
    if (selectedDate && selectedTime) {
      // Corrected template literal
      const combined = parse(`${selectedDate}T${selectedTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
      return isValid(combined) ? combined : null;
    }
    // Ensure a value is always returned if the condition isn't met
    return null;
  };

  const handleSave = () => {
    const dateTime = getCombinedDateTime();
    if (dateTime) {
      console.log("Selected DateTime:", format(dateTime, "PPP HH:mm:ss"));
      // Here you would typically pass this dateTime value to your state management or API call
    } else {
      console.log("Invalid date or time selected");
    }
    setIsDialogOpen(false);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Native DateTime Picker Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date and Time (Native)</DialogTitle>
          <DialogDescription>
            Pick a date and time for the event using native browser inputs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="native-date" className="text-right col-span-1">
              Date
            </Label>
            {/* Using shadcn Input as a wrapper for styling consistency if desired, but type="date" is key */}
            <Input
              id="native-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="native-time" className="text-right col-span-1">
              Time
            </Label>
            <Input
              id="native-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          {getCombinedDateTime() && (
            <p className="text-sm text-muted-foreground mt-2 col-span-4 text-center">
              Selected: {format(getCombinedDateTime()!, "PPP HH:mm")}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}