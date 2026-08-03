import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[var(--color-red)]" />
          </div>
          <p className="text-sm text-[var(--color-text)] leading-relaxed pt-1.5">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
