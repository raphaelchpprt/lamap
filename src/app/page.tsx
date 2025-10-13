import { Suspense } from 'react';

import MapView from '@/components/MapView';

export default function HomePage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Chargement de la carte...
              </p>
            </div>
          </div>
        }
      >
        <MapView />
      </Suspense>
    </div>
  );
}
