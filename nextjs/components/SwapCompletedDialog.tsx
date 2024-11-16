// components/SwapCompletedDialog.tsx
import React from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Check } from "lucide-react";

type SwapResult = {
  swappedAmount: string;
  hash: string;
};

type SwapCompletedDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  swapResult: SwapResult;
};

export function SwapCompletedDialog({ isOpen, onClose, swapResult }: SwapCompletedDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Swap Completed</DialogTitle>
          <DialogDescription>The transaction has been processed successfully.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold">Swapped Amount</p>
              <p className="text-sm text-muted-foreground">{swapResult.swappedAmount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold">Fee</p>
              <p className="text-sm text-muted-foreground">{}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold">Transaction Hash</p>
              <p className="text-sm text-muted-foreground">{swapResult.hash}</p>
            </div>
          </div>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}

export default SwapCompletedDialog;