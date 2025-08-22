import { PlateEditor } from '@/components/platejs/components/editor/plate-editor';
import { Toaster } from 'sonner';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />

      <Toaster />
    </div>
  );
}
