import { createFileRoute } from '@tanstack/react-router';
import { HistoryView } from '@/views/HistoryView';

export const Route = createFileRoute('/_layout/_auth/history')({
  ssr: false,
  component: HistoryView,
});
