import { useAppStore } from '@/lib/store'

export default function Toast() {
  const { toast } = useAppStore()

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] slide-in">
      <div className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap
        ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
        {toast.message}
      </div>
    </div>
  )
}
