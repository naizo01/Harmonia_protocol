// components/TransactionProcessingDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Loader2 } from "lucide-react";

type TransactionProcessingDialogProps = {
  isOpen: boolean;
  isConfirming: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function TransactionProcessingDialog({ isOpen, isConfirming, onOpenChange }: TransactionProcessingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <DialogTitle>Processing Transaction</DialogTitle>
          <DialogDescription>
            {isConfirming ? "Waiting for confirmation..." : "Initiating transaction..."}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TransactionProcessingDialog;
