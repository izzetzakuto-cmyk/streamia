import { useEffect, useRef, useState } from 'react'
import { Upload, Loader2, ImagePlus } from 'lucide-react'
import { uploadApi, uploadFile } from '@/lib/api'

/**
 * Drop-in presigned-upload button. Handles storage-disabled fallback gracefully.
 *
 * <ImageUpload kind="avatar" value={url} onChange={setUrl} />
 */
export default function ImageUpload({ kind = 'avatar', value, onChange, label = 'Upload image', className = '' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [storageEnabled, setStorageEnabled] = useState(true)

  useEffect(() => {
    let cancelled = false
    uploadApi.status()
      .then((r) => { if (!cancelled) setStorageEnabled(Boolean(r?.enabled)) })
      .catch(() => { if (!cancelled) setStorageEnabled(false) })
    return () => { cancelled = true }
  }, [])

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadFile({ file, kind })
      onChange?.(url)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (!storageEnabled) {
    return (
      <div className={`text-[11.5px] text-gray-400 italic ${className}`}>
        Upload disabled (storage not configured yet). Paste a URL above instead.
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
            <ImagePlus className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:border-gray-400 disabled:opacity-50 transition"
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> Uploading…</>
            : <><Upload className="w-3.5 h-3.5" strokeWidth={2.5} /> {label}</>}
        </button>
        {value && (
          <button type="button" onClick={() => onChange?.('')} className="text-[11.5px] font-semibold text-gray-400 hover:text-red-500 transition">Remove</button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {error && <div className="text-[11px] text-red-500 mt-1.5 font-semibold">{error}</div>}
      <div className="text-[10.5px] text-gray-400 mt-1">PNG, JPG, WebP or GIF · max 5MB</div>
    </div>
  )
}
