import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function RootLayout() {
  return (
    <div className="flex min-h-screen w-full gap-4 bg-[#f5f7fb] p-4 transition-colors dark:bg-neutral-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
