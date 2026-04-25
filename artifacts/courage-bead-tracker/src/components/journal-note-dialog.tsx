import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBeadStore } from "@/hooks/use-bead-store";
import { useToast } from "@/hooks/use-toast";
import type { JournalNote } from "@/lib/types";
import { Trash2, BookHeart } from "lucide-react";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: JournalNote | null; // when provided, edit mode
  defaultDate?: string; // YYYY-MM-DD for create mode
};

function todayYmd(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toYmd(iso: string): string {
  // Accept either YYYY-MM-DD or full ISO; return YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return todayYmd();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function JournalNoteDialog({
  open,
  onOpenChange,
  note,
  defaultDate,
}: Props) {
  const mode: Mode = note ? "edit" : "create";
  const { addNote, updateNote, deleteNote } = useBeadStore();
  const { toast } = useToast();

  const initialDate = useMemo(() => {
    if (note) return toYmd(note.date);
    if (defaultDate) return toYmd(defaultDate);
    return todayYmd();
  }, [note, defaultDate]);

  const [date, setDate] = useState(initialDate);
  const [text, setText] = useState(note?.text ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form whenever the dialog opens for a different note/date.
  useEffect(() => {
    if (open) {
      setDate(initialDate);
      setText(note?.text ?? "");
      setConfirmDelete(false);
    }
  }, [open, initialDate, note?.id, note?.text]);

  const trimmed = text.trim();
  const canSave = trimmed.length > 0 && date.length > 0;

  function handleSave() {
    if (!canSave) return;
    if (mode === "edit" && note) {
      updateNote(note.id, { date, text: trimmed });
      toast({ title: "Reflection updated" });
    } else {
      addNote({ date, text: trimmed });
      toast({ title: "Reflection saved" });
    }
    onOpenChange(false);
  }

  function handleDelete() {
    if (!note) return;
    deleteNote(note.id);
    toast({ title: "Reflection deleted" });
    setConfirmDelete(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] sm:max-w-[440px] rounded-3xl border-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {mode === "edit" ? "Edit reflection" : "Add reflection"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Capture a longer note or memory tied to a specific date.
        </DialogDescription>

        <div
          className="px-6 pt-6 pb-5"
          style={{
            background:
              "linear-gradient(160deg, #FFF8E5 0%, #FFE3E2 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-primary shadow-sm">
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground leading-tight">
                {mode === "edit" ? "Edit reflection" : "New reflection"}
              </h2>
              <p className="text-xs text-muted-foreground">
                A longer note for a single day or week.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 bg-card">
          <div className="space-y-2">
            <label
              htmlFor="journal-date"
              className="text-sm font-medium text-foreground"
            >
              Date
            </label>
            <Input
              id="journal-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 text-base"
              data-testid="journal-date-input"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="journal-text"
              className="text-sm font-medium text-foreground"
            >
              Reflection
            </label>
            <Textarea
              id="journal-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What happened today? How were they brave?"
              rows={6}
              className="resize-none text-base leading-relaxed"
              data-testid="journal-text-input"
            />
            <p className="text-xs text-muted-foreground">
              {trimmed.length} characters
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-1 bg-card flex items-center gap-3">
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-destructive hover:bg-destructive/10 active:scale-95 transition-all shrink-0"
              aria-label="Delete reflection"
              data-testid="journal-delete-button"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl h-12 flex-1"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-2xl h-12 flex-1"
            data-testid="journal-save-button"
          >
            {mode === "edit" ? "Save" : "Add"}
          </Button>
        </div>

        <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl">
            <DialogTitle className="text-destructive font-display">
              Delete this reflection?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove this note. You can't undo this.
            </DialogDescription>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="rounded-2xl"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
