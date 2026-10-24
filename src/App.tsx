import { RouterProvider } from 'react-router';
import { AppProviders } from '@/app/providers';
import { createAppRouter } from '@/app/router';

const appRouter = createAppRouter();

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}

export default App;
