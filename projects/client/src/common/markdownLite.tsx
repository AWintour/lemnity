import { Fragment, type ReactNode } from 'react'

// Безопасный мини-markdown для сообщений чата: **жирный**, _курсив_/*курсив*, ~~зачёркнутый~~,
// [текст](url), маркированные (- / *) и нумерованные (1.) списки. Без dangerouslySetInnerHTML;
// ссылки — только http(s)/mailto.

const safeHref = (url: string): string | null =>
  /^(https?:\/\/|mailto:)/i.test(url) ? url : null

const inline = (text: string, key: string): ReactNode[] => {
  const out: ReactNode[] = []
  let rest = text
  let i = 0
  while (rest.length) {
    const cands: { idx: number; len: number; node: ReactNode }[] = []
    let m: RegExpExecArray | null
    if ((m = /\*\*([^*]+?)\*\*/.exec(rest)))
      cands.push({ idx: m.index, len: m[0].length, node: <strong key={`${key}-${i}b`}>{inline(m[1], `${key}-${i}b`)}</strong> })
    if ((m = /~~([^~]+?)~~/.exec(rest)))
      cands.push({ idx: m.index, len: m[0].length, node: <del key={`${key}-${i}s`}>{inline(m[1], `${key}-${i}s`)}</del> })
    if ((m = /(?:\*|_)([^*_\n]+?)(?:\*|_)/.exec(rest)))
      cands.push({ idx: m.index, len: m[0].length, node: <em key={`${key}-${i}i`}>{inline(m[1], `${key}-${i}i`)}</em> })
    if ((m = /\[([^\]\n]+?)\]\(([^)\s]+?)\)/.exec(rest))) {
      const href = safeHref(m[2])
      cands.push({
        idx: m.index,
        len: m[0].length,
        node: href ? (
          <a key={`${key}-${i}l`} href={href} target="_blank" rel="noreferrer noopener" className="underline">{m[1]}</a>
        ) : (
          <Fragment key={`${key}-${i}l`}>{m[0]}</Fragment>
        ),
      })
    }
    if (!cands.length) {
      out.push(rest)
      break
    }
    cands.sort((a, b) => a.idx - b.idx)
    const best = cands[0]
    if (best.idx > 0) out.push(rest.slice(0, best.idx))
    out.push(best.node)
    rest = rest.slice(best.idx + best.len)
    i++
  }
  return out
}

const BULLET = /^\s*[-*]\s+(.*)$/
const ORDERED = /^\s*\d+\.\s+(.*)$/

/** Рендер строки сообщения с мини-markdown. Используется в пузырях кабинета и виджета. */
export const renderMarkdown = (text: string): ReactNode => {
  const lines = (text ?? '').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let b = 0
  while (i < lines.length) {
    if (BULLET.test(lines[i])) {
      const items: ReactNode[] = []
      for (; i < lines.length && BULLET.test(lines[i]); i++)
        items.push(<li key={`li${b}-${i}`}>{inline(lines[i].replace(BULLET, '$1'), `ul${b}-${i}`)}</li>)
      blocks.push(<ul key={`ul${b}`} className="list-disc pl-5 my-0.5">{items}</ul>)
      b++
      continue
    }
    if (ORDERED.test(lines[i])) {
      const items: ReactNode[] = []
      for (; i < lines.length && ORDERED.test(lines[i]); i++)
        items.push(<li key={`li${b}-${i}`}>{inline(lines[i].replace(ORDERED, '$1'), `ol${b}-${i}`)}</li>)
      blocks.push(<ol key={`ol${b}`} className="list-decimal pl-5 my-0.5">{items}</ol>)
      b++
      continue
    }
    const last = i === lines.length - 1
    blocks.push(
      <Fragment key={`ln${i}`}>
        {inline(lines[i], `ln${i}`)}
        {last ? '' : '\n'}
      </Fragment>,
    )
    i++
  }
  return blocks
}
