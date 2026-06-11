import { useEffect, useState } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Switch } from '@heroui/switch'
import * as managersService from '@/services/managers'
import type { ManagerItem, ManagerType } from '@/services/managers'

/** Инлайн-панель управления менеджерами проекта (вкладка «Звонки» → «Менеджеры»). */
const ManagersPanel = ({ projectId, onClose }: { projectId: string; onClose: () => void }) => {
  const [managers, setManagers] = useState<ManagerItem[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<ManagerType>('Телефон')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await managersService.listManagers(projectId)
      setManagers(r.managers)
    } catch {
      setManagers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const add = async () => {
    if (!name.trim() || !address.trim()) return
    setSaving(true)
    try {
      const created = await managersService.createManager(projectId, {
        name: name.trim(),
        type,
        address: address.trim()
      })
      // Показываем сразу (без повторного запроса списка).
      setManagers(prev => [...prev, created])
      setName('')
      setAddress('')
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (m: ManagerItem) => {
    await managersService.updateManager(projectId, m.id, { enabled: !m.enabled })
    await load()
  }

  const remove = async (m: ManagerItem) => {
    await managersService.deleteManager(projectId, m.id)
    await load()
  }

  return (
    <div className="rounded-[12px] border border-default-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-black">Менеджеры проекта</h2>
        <Button size="sm" variant="light" onPress={onClose}>
          Скрыть
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input label="Имя" value={name} onValueChange={setName} size="sm" className="sm:flex-1" />
        <Select
          label="Тип"
          selectedKeys={new Set([type])}
          onSelectionChange={k => setType(Array.from(k as Set<string>)[0] as ManagerType)}
          size="sm"
          className="sm:w-[150px]"
        >
          <SelectItem key="Телефон">Телефон</SelectItem>
          <SelectItem key="SIP">SIP</SelectItem>
        </Select>
        <Input
          label={type === 'SIP' ? 'SIP / extension' : 'Номер'}
          value={address}
          onValueChange={setAddress}
          size="sm"
          className="sm:flex-1"
        />
        <Button
          isLoading={saving}
          onPress={add}
          isDisabled={!name.trim() || !address.trim()}
          className="h-10 bg-[#5B55FF] text-white"
        >
          Добавить
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {loading && <div className="text-[14px] text-default-500">Загрузка…</div>}
        {!loading && managers.length === 0 && (
          <div className="text-[14px] text-default-500">
            Менеджеров пока нет — добавьте, чтобы распределять звонки.
          </div>
        )}
        {managers.map(m => (
          <div
            key={m.id}
            className="flex items-center justify-between rounded-lg border border-default-200 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-[14px] text-black">{m.name}</span>
              <span className="text-[12px] text-default-500">
                {m.type} · {m.address}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch isSelected={m.enabled} onValueChange={() => void toggle(m)} size="sm" />
              <Button size="sm" variant="light" color="danger" onPress={() => void remove(m)}>
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManagersPanel
