import { useState } from 'react'
import { Button } from '@heroui/button'
import type { CallItem } from '@/services/calls'
import { fetchRecordingBlobUrl } from '@/services/calls'
import { CALL_STATUS_META, CALLS_GRID_CLASS, formatDuration, formatTimeAndDate } from '../calls.model'

const CallRow = ({ call }: { call: CallItem }) => {
  const meta = CALL_STATUS_META[call.status]
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const play = async () => {
    setLoading(true)
    setError(false)
    try {
      setAudioUrl(await fetchRecordingBlobUrl(call.id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`${CALLS_GRID_CLASS} items-center rounded-[12px] border px-4 py-3 text-[14px] text-black ${meta.row}`}
    >
      <div>{formatTimeAndDate(call.createdAt)}</div>
      <div className="truncate">{call.phone ?? '—'}</div>
      <div className="truncate">{call.managerName ?? '—'}</div>
      <div>{formatDuration(call.durationSec)}</div>
      <div>
        <span className={`inline-block rounded-full px-3 py-1 text-[12px] ${meta.pill}`}>
          {meta.label}
        </span>
      </div>
      <div>
        {!call.hasRecording ? (
          <span className="text-default-400">—</span>
        ) : audioUrl ? (
          <audio src={audioUrl} controls autoPlay className="h-8 w-full max-w-[220px]" />
        ) : (
          <Button
            size="sm"
            isLoading={loading}
            onPress={play}
            className="h-8 rounded-lg bg-[#5B55FF] text-white px-3 text-[12px] hover:bg-[#514BFF]"
          >
            {error ? 'Повторить' : 'Прослушать'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CallRow
