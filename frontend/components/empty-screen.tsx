import { UseChatHelpers } from 'ai/react'

import { ExternalLink } from '@/components/external-link'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconExternalLink,
  IconGitHub,
  IconNextChat,
  IconOpenAI,
  IconSeparator,
  IconVercel,
  IconArrowRight
} from '@/components/ui/icons'

import { cn } from '@/lib/utils'

import Link from 'next/link'


const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="flex justify-center mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="flex justify-center mb-2 text-lg font-semibold">
          Welcome to Athena!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          {' '}<Link 
          href="/credentials"
        >Get started by connecting your external data sources.</Link>
        </p>
        <div className="flex justify-center">
        <Link 
          href="/credentials" 
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconExternalLink></IconExternalLink>
          <span className="items-center justify-end hidden ml-2 md:flex ">Connect Data</span>
        </Link>
        </div>
      </div>
    </div>
  )
}
