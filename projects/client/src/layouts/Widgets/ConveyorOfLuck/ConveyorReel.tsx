import type { SectorItem } from '@stores/widgetSettings/types'
import { memo, useEffect, useMemo, useRef, type ReactElement } from 'react'
import * as Icons from '@/components/Icons'
import SvgIcon from '@/components/SvgIcon'
import iconTrophy from '@/assets/icons/trophy.svg'
import iconSparkles from '@/assets/icons/sparkles.svg'
import iconRocket from '@/assets/icons/rocket.svg'
import { motion, useAnimation } from 'framer-motion'

// Призовые иконки из Select строки сектора (ключ → ассет).
const PRIZE_ICONS: Record<string, string> = {
  trophy: iconTrophy,
  star: iconSparkles,
  rocket: iconRocket
}
import { createDefaultSector } from '@/layouts/Widgets/WheelOfFortune/createDefaultSector'
import { generateRandomHexColor } from '@/common/utils/generateRandomColor'

type ReelOrientation = 'vertical' | 'horizontal'

type ConveyorReelProps = {
  sectors?: number | SectorItem[]
  className?: string
  orientation?: ReelOrientation
  spinTrigger?: number // изменение значения запускает приземление на победителя
  winningSectorId?: string | null
  sectorsRandomize?: boolean
  borderColor?: string
  borderThickness?: number
  backgroundColor?: string // цвет общего фона модалки — для окантовки указателя («вырез»)
  cardRadius?: number // радиус скругления углов карточек (px)
  pointerSide?: 'left' | 'right' // сторона указателя у вертикальной ленты
}

const MIN_SECTORS = 4
const MAX_SECTORS = 8

// Геометрия: квадратные карточки. Вертикаль (desktop) — крупно, как в макете;
// горизонталь (mobile) — компактнее. Фиксированные px → точная математика цикла.
// CARD_W/CARD_H — размеры карточки. По главной оси (вертикаль — высота, горизонталь —
// ширина) карточка вытянута, чтобы заполнять окно почти до краёв. WINDOW_MAIN — высота окна
// (вертикаль) / ширина окна (горизонталь) — оставлены «как было».
const CONFIG: Record<
  ReelOrientation,
  { CARD_W: number; CARD_H: number; GAP: number; WINDOW_MAIN: number }
> = {
  vertical: { CARD_W: 340, CARD_H: 340, GAP: 18, WINDOW_MAIN: 470 },
  horizontal: { CARD_W: 270, CARD_H: 270, GAP: 14, WINDOW_MAIN: 470 }
}

const STRIP_COPIES = 14
const SPIN_SETS = 7
const IDLE_PX_PER_SEC = 60 // скорость холостого хода ленты

function normalizeSectors(input?: number | SectorItem[]): SectorItem[] {
  if (Array.isArray(input) && input.length > 0) {
    const items = input.filter(Boolean).slice(0, MAX_SECTORS)
    const filledSectors = items.filter(
      item =>
        (item.mode === 'text' && item.text && item.text.trim().length) ||
        (item.mode === 'icon' && item.icon)
    )
    if (filledSectors.length > 0) {
      return items.map((item, i) => {
        const sourceSector = filledSectors[i % filledSectors.length]
        return {
          ...item,
          mode: sourceSector.mode,
          text: sourceSector.text,
          icon: sourceSector.icon,
          textColor: sourceSector.textColor,
          textSize: sourceSector.textSize,
          iconSize: sourceSector.iconSize
        }
      })
    }
    return items.map(item => ({ ...item, color: item.color || generateRandomHexColor() }))
  }
  const requested = typeof input === 'number' ? input : MIN_SECTORS
  const count = Math.min(MIN_SECTORS, Math.max(MIN_SECTORS, requested))
  return Array.from({ length: count }).map(createDefaultSector)
}

// 3D-«звезда удачи» по умолчанию (золотой градиент + объём), как на макете.
const LuckStar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="col-star" cx="42%" cy="34%" r="80%">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="45%" stopColor="#FFCB3A" />
        <stop offset="100%" stopColor="#F39B00" />
      </radialGradient>
    </defs>
    <path
      d="M50 4 L61 36 L95 36 L67 57 L78 90 L50 70 L22 90 L33 57 L5 36 L39 36 Z"
      fill="url(#col-star)"
      stroke="#E8890B"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)

export const ReelCard = ({
  item,
  width,
  height,
  cardRadius = 24
}: {
  item: SectorItem
  width: number
  height: number
  cardRadius?: number
}) => {
  // Обложка-картинка: «Вид обложки = Картинка» → картинка на всю карточку (с выравниванием).
  const isImageCover = item.coverType === 'image'
  const imageUrl = item.image?.url
  const objectPosition =
    item.imageAlign === 'top' ? 'center top' : item.imageAlign === 'bottom' ? 'center bottom' : 'center'
  const isCustom = item.colorScheme === 'custom'
  const color = (isCustom && item.bgColor) || item.color || '#FF7A1A'
  const textColor = item.systemTextColor || item.textColor || '#FFFFFF'
  const iconColor = item.iconColor || textColor
  const badgeEnabled = !!item.badgeEnabled
  const badgeBg = item.badgeColor ?? '#FFFFFF'
  const badgeText = item.badgeTextColor ?? '#000000'
  const darkenEnabled = !!item.darkenEnabled
  const darkenHeight = typeof item.darkenHeight === 'number' ? item.darkenHeight : 60
  const displayText = item.text && item.text.trim().length ? item.text : 'Бонус'
  // Иконка из библиотеки (@/components/Icons) по имени, либо URL, либо звезда по умолчанию.
  const iconsLib = Icons as Record<string, unknown>
  const LibIcon =
    item.icon && typeof iconsLib[item.icon] === 'function'
      ? (iconsLib[item.icon] as () => ReactElement)
      : undefined
  const prizeUrl = item.icon ? PRIZE_ICONS[item.icon] : undefined
  const iconUrl =
    item.icon && /^(https?:|\/|data:)/.test(item.icon) ? item.icon : undefined
  const base = Math.min(width, height)
  // Иконка/плейсхолдер картинки — фиксированный размер (одинаковый, менять нельзя).
  const iconSize = Math.round(base * 0.52)
  const textSize = Math.max(
    15,
    item.textSize ? Math.round(item.textSize * (width / 360)) : Math.round(base * 0.077)
  )
  // Лучи-«солнце» из центра + лёгкий световой блик сверху (без тени снизу).
  const rays = `repeating-conic-gradient(from 95deg at 50% 42%, ${color} 0deg 11deg, #ffffff 11deg 22deg)`
  const depth = 'linear-gradient(to bottom, rgba(255,255,255,.20) 0%, rgba(255,255,255,0) 28%)'

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width,
        height,
        borderRadius: cardRadius,
        backgroundImage: isImageCover ? undefined : rays,
        backgroundColor: isImageCover ? '#E9E9EE' : undefined
      }}
    >
      {isImageCover ? (
        imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition }}
          />
        ) : (
          // Плейсхолдер «место под картинку» (на всю карточку).
          <div className="absolute inset-0 flex items-center justify-center text-[#B7B7C0]">
            <svg
              width={Math.round(base * 0.26)}
              height={Math.round(base * 0.26)}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-3 6 4-5 3 3.72L15.5 11l4.5 6H5z" />
            </svg>
          </div>
        )
      ) : null}
      <div className="absolute inset-0" style={{ backgroundImage: depth }} />
      {darkenEnabled ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,.62) 0%, rgba(0,0,0,0) ${darkenHeight}%)`
          }}
        />
      ) : null}
      {isImageCover ? null : (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ paddingBottom: height * 0.12 }}
      >
        {LibIcon ? (
          <div style={{ width: iconSize, height: iconSize, color: iconColor }}>
            <LibIcon />
          </div>
        ) : prizeUrl ? (
          <div
            className="flex items-center justify-center"
            style={{ width: iconSize, height: iconSize, color: iconColor }}
          >
            <SvgIcon src={prizeUrl} size={iconSize} />
          </div>
        ) : iconUrl ? (
          <img
            src={iconUrl}
            alt=""
            style={{ width: iconSize, height: iconSize, objectFit: 'contain' }}
          />
        ) : (
          <LuckStar size={iconSize} />
        )}
      </div>
      )}
      {badgeEnabled ? (
        // Плашка: текст на фоновой подложке снизу (как в макете).
        <div
          className="absolute inset-x-0 bottom-0 text-center font-rubik font-bold leading-tight"
          style={{
            background: badgeBg,
            color: badgeText,
            fontSize: textSize,
            padding: `${height * 0.06}px ${width * 0.07}px`,
            borderTopLeftRadius: Math.round(width * 0.06),
            borderTopRightRadius: Math.round(width * 0.06)
          }}
        >
          {displayText.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ) : (
        <div
          className="absolute inset-x-0 bottom-0 text-center"
          style={{ padding: `0 ${width * 0.07}px ${height * 0.06}px` }}
        >
          <div
            className="font-rubik font-bold leading-tight"
            style={{
              color: textColor,
              fontSize: textSize,
              textShadow: '0 2px 8px rgba(0,0,0,.45)'
            }}
          >
            {displayText.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ConveyorReel = ({
  sectors,
  className,
  orientation = 'vertical',
  spinTrigger,
  winningSectorId,
  sectorsRandomize,
  backgroundColor = '#725DFF',
  cardRadius = 24,
  pointerSide = 'left'
}: ConveyorReelProps) => {
  const { CARD_W, CARD_H, GAP, WINDOW_MAIN } = CONFIG[orientation]
  const isHorizontal = orientation === 'horizontal'
  // Размер карточки вдоль оси прокрутки (вертикаль — высота, горизонталь — ширина).
  const CARD_MAIN = isHorizontal ? CARD_W : CARD_H
  const STEP = CARD_MAIN + GAP
  const WINDOW_CENTER = WINDOW_MAIN / 2

  const normalizedItems = normalizeSectors(sectors)
  const itemsKey = normalizedItems
    .map(i => `${i.id}:${i.color}:${i.text ?? ''}:${i.icon ?? ''}`)
    .join('|')

  const shuffledItems = useMemo(
    () => {
      const withIndex = normalizedItems.map((item, index) => ({ item, index }))
      return sectorsRandomize ? [...withIndex].sort(() => Math.random() - 0.5) : withIndex
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey, sectorsRandomize]
  )
  const items = shuffledItems.map(entry => entry.item)
  const count = items.length || 1
  const oneSetMain = count * STEP

  const strip = useMemo(
    () => Array.from({ length: STRIP_COPIES }).flatMap(() => items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemsKey, sectorsRandomize]
  )

  const controls = useAnimation()
  const prevSpinTriggerRef = useRef(spinTrigger)
  const spunRef = useRef(false)

  // База выравнивания: одна карточка отцентрована под указателем, соседние видны частично.
  const aligned = WINDOW_CENTER - CARD_MAIN / 2 - STEP

  // Типобезопасные таргеты по выбранной оси (x — горизонталь, y — вертикаль).
  const at = (val: number) => (isHorizontal ? { x: val } : { y: val })
  const keyframes = (a: number, b: number) => (isHorizontal ? { x: [a, b] } : { y: [a, b] })

  const winningIndex = (() => {
    if (!winningSectorId) return 0
    const idx = shuffledItems.findIndex(({ item }) => item.id === winningSectorId)
    return idx >= 0 ? idx : 0
  })()

  // Холостой ход: бесшовный непрерывный цикл (лента всё время плавно движется).
  // Шаг ровно в один набор секторов → на стыке кадр совпадает, движение без рывков.
  // Зависим только от длины набора/ориентации: правки полей сектора (цвет/текст) не должны
  // перезапускать цикл — иначе лента «скачет» на каждое изменение.
  useEffect(() => {
    if (spunRef.current) return
    controls.set(at(aligned))
    controls.start({
      ...keyframes(aligned, aligned - oneSetMain),
      transition: {
        duration: oneSetMain / IDLE_PX_PER_SEC,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop'
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneSetMain, orientation])

  // Спин «как в рулетке»: резкий быстрый старт и долгое плавное замедление до полной
  // остановки точно на секторе-победителе (одна фаза, сильный ease-out, много оборотов).
  useEffect(() => {
    if (spinTrigger === undefined || spinTrigger === prevSpinTriggerRef.current) return
    prevSpinTriggerRef.current = spinTrigger
    spunRef.current = true

    const finalIndex = SPIN_SETS * count + winningIndex
    const final = WINDOW_CENTER - (finalIndex * STEP + CARD_MAIN / 2)

    controls.set(at(aligned))
    controls
      .start({
        ...at(final),
        // ease-out: мгновенный быстрый разгон в начале, длинный «хвост» торможения в конце.
        transition: { duration: 5.4, ease: [0.08, 0.82, 0.12, 1] }
      })
      .then(() => {
        spunRef.current = false
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinTrigger, winningIndex, count, orientation])

  // Размер окна: по главной оси — WINDOW_MAIN, по поперечной — высота карточки.
  const windowStyle = isHorizontal
    ? { width: WINDOW_MAIN, height: CARD_H }
    : { width: CARD_W, height: WINDOW_MAIN }

  return (
    <div className={`w-full flex items-center justify-center ${className ?? ''}`}>
      <div className="relative" style={isHorizontal ? { width: WINDOW_MAIN } : { width: CARD_W }}>
        {/* Указатель из strelka.svg: вертикаль — слева (вправо), горизонталь — сверху (вниз,
            поворот 90°). Окантовка — цветом общего фона (динамически) для эффекта «выреза». */}
        <div
          className={
            isHorizontal
              ? 'absolute z-20 left-1/2 -top-7 -translate-x-1/2'
              : pointerSide === 'right'
                ? 'absolute z-20 -right-7 top-1/2 -translate-y-1/2'
                : 'absolute z-20 -left-7 top-1/2 -translate-y-1/2'
          }
        >
          <svg
            width={54}
            height={53}
            viewBox="0 0 39 38"
            fill="none"
            style={
              isHorizontal
                ? { transform: 'rotate(90deg)' }
                : pointerSide === 'right'
                  ? { transform: 'rotate(180deg)' }
                  : undefined
            }
          >
            <path
              d="M1.5 4.73633C1.5 2.54097 3.72913 0.765349 5.92578 1.82813L35.7109 16.2402C38.1176 17.4047 38.0926 20.9612 35.6562 22.0811L5.87109 35.7715C3.68134 36.778 1.5 35.0094 1.5 32.8379L1.5 23.667C1.5 22.4996 2.11965 21.3788 3.18359 20.8125L6.16113 19.2275C6.19164 19.2112 6.24821 19.1627 6.25391 19.0361C6.25958 18.909 6.20677 18.8451 6.16797 18.8193L2.9248 16.6621C2.01481 16.0567 1.5 15.0267 1.5 13.9619L1.5 4.73633Z"
              fill="#FFFFFF"
              stroke={backgroundColor}
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Окно барабана: радиус 15px по углам, карточки с зазорами на фоне модалки */}
        <div className="relative overflow-hidden rounded-[15px]" style={windowStyle}>
          <motion.div
            animate={controls}
            initial={at(aligned)}
            className={isHorizontal ? 'flex flex-row items-center' : 'flex flex-col items-center'}
            style={{ gap: GAP, willChange: 'transform' }}
          >
            {strip.map((item, i) => (
              <ReelCard
                key={`${item.id ?? 'c'}-${i}`}
                item={item}
                width={CARD_W}
                height={CARD_H}
                cardRadius={cardRadius}
              />
            ))}
          </motion.div>

          {/* Объём барабана: усиленное затемнение по концам главной оси */}
          {isHorizontal ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/35 via-black/10 to-transparent" />
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(ConveyorReel)
