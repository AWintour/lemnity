// import { useFieldsSettings } from '@/stores/widgetSettings/fieldsHooks'

// const Headline = ({ text, size, color }: { text: string; size?: number; color?: string }) => (
//   <h2
//     className="whitespace-pre-wrap font-bold leading-tight mb-2 text-center"
//     style={{ fontSize: size ? `${size}px` : undefined, color: color ?? '#000000' }}
//   >
//     {text}
//   </h2>
// )

// type ColorScheme = {
//   enabled?: boolean
//   scheme?: 'primary' | 'custom'
//   discount?: { color?: string; bgColor?: string }
//   promo?: { color?: string; bgColor?: string }
// }

// export type RewardContentProps = {
//   companyLogo?: { enabled?: boolean; url?: string }
//   discountText?: string
//   promo?: string
//   onWin?: {
//     enabled?: boolean
//     text?: string
//     textSize?: number
//     description?: string
//     descriptionSize?: number
//     discount?: string
//     discountColor?: string
//     discountSize?: number
//     promo?: string
//     promoColor?: string
//     promoSize?: number
//     colorScheme?: ColorScheme
//   }
//   className?: string
// }

// const RewardContent = ({
//   companyLogo,
//   discountText: discountTextProp,
//   promo,
//   onWin,
//   className
// }: RewardContentProps) => {
//   const { settings } = useFieldsSettings()
//   const defaultOnWin = settings.messages?.onWin ?? onWin
//   if (!defaultOnWin?.enabled) return null
//   const resolvedDiscountText =
//     (typeof discountTextProp === 'string' ? discountTextProp.trim() : undefined) ??
//     defaultOnWin.discount ??
//     'Скидка 10%'
//   const promoText = promo?.trim() || defaultOnWin.promo
//   const scheme = defaultOnWin.colorScheme ?? {}
//   const hasCustomScheme = Boolean(scheme.enabled && scheme.scheme === 'custom')
//   const discountTextColor =
//     defaultOnWin.discountColor ??
//     (hasCustomScheme ? (scheme.discount?.color ?? '#000000') : '#000000')
//   const discountBgColor = hasCustomScheme ? (scheme.discount?.bgColor ?? '#FFF57F') : '#FFF57F'
//   const promoTextColor =
//     defaultOnWin.promoColor ?? (hasCustomScheme ? (scheme.promo?.color ?? '#FFFFFF') : '#FFFFFF')
//   const promoBgColor = hasCustomScheme ? (scheme.promo?.bgColor ?? '#0069FF') : '#0069FF'

//   return (
//     <div
//       className={`flex flex-col gap-4 w-88 min-w-75 md:min-w-125 items-center justify-self-center ${className ?? ''}`}
//     >
//       {companyLogo?.enabled && companyLogo.url && (
//         <img src={companyLogo.url} alt="Company Logo" className="w-25 h-12.5 object-contain" />
//       )}
//       <Headline
//         text={defaultOnWin.text ?? ''}
//         size={defaultOnWin.textSize}
//         color={defaultOnWin.textColor ?? '#000000'}
//       />
//       {resolvedDiscountText ? (
//         <div
//           className="h-10 w-full rounded-full font-medium flex items-center justify-center"
//           style={{
//             backgroundColor: discountBgColor,
//             color: discountTextColor,
//             fontSize: defaultOnWin.discountSize ? `${defaultOnWin.discountSize}px` : undefined
//           }}
//         >
//           {resolvedDiscountText}
//         </div>
//       ) : null}
//       <div
//         className="whitespace-pre-wrap text-center opacity-90"
//         style={{
//           fontSize: defaultOnWin.descriptionSize ? `${defaultOnWin.descriptionSize}px` : undefined,
//           color: defaultOnWin.descriptionColor ?? '#000000'
//         }}
//       >
//         {defaultOnWin.description}
//       </div>
//       {promoText ? (
//         <div
//           className="flex flex-col gap-1 p-2 border border-dashed w-full rounded-[10px] tracking-wider items-center justify-center"
//           style={{
//             color: promoTextColor,
//             backgroundColor: promoBgColor,
//             fontSize: defaultOnWin.promoSize ? `${defaultOnWin.promoSize}px` : undefined
//           }}
//         >
//           <span className="font-bold whitespace-pre-wrap">{promoText}</span>
//         </div>
//       ) : null}
//     </div>
//   )
// }

// export default RewardContent
