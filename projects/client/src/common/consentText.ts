// Единый источник текста согласия для блока «Согласие и политика»: используется и подсказкой
// в настройках (AgreementAndPolicy), и реальным чекбоксом в виджете (ConsentRow) — чтобы текст
// и слова-ссылки не расходились. «Согласие» ведёт на URL согласия, «Политикой конфиденциальности»
// — на URL политики обработки персональных данных.
export const CONSENT_PREFIX = 'Я даю '
export const CONSENT_AGREEMENT_LABEL = 'Согласие'
export const CONSENT_MIDDLE = ' на обработку персональных данных в соответствии с '
export const CONSENT_POLICY_LABEL = 'Политикой конфиденциальности'

// Полный текст подсказки/превью одной строкой.
export const consentDisclaimer =
  `${CONSENT_PREFIX}${CONSENT_AGREEMENT_LABEL}${CONSENT_MIDDLE}${CONSENT_POLICY_LABEL}`
