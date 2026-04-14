import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-brand-dark">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-brand-red underline underline-offset-2 hover:text-brand-red/75 transition-colors"
      >
        {children}
      </a>
    ),
  },
}

type Props = {
  value: unknown[]
}

export default function PortableTextRenderer({ value }: Props) {
  return (
    <div className="prose prose-zinc prose-sm sm:prose-base max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-brand-red prose-strong:text-brand-dark">
      <PortableText value={value} components={components} />
    </div>
  )
}
