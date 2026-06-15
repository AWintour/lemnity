import type { ChannelAdapter, SocialType } from './channel-adapter'
import { telegramAdapter } from './telegram.adapter'
import { vkAdapter } from './vk.adapter'
import { maxAdapter } from './max.adapter'

const REGISTRY: Record<SocialType, ChannelAdapter> = {
  telegram: telegramAdapter,
  vk: vkAdapter,
  max: maxAdapter
}

export const getAdapter = (type: SocialType): ChannelAdapter => REGISTRY[type]

export * from './channel-adapter'
