import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

/** Fallback for unknown URLs so there are no dead links. */
export default function NotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110"
          >
            Back to Overview
          </Link>
        }
      />
    </Card>
  );
}
