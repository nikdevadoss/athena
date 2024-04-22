import { UseChatHelpers } from 'ai/react'

import { ExternalLink } from '@/components/external-link'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconExternalLink,
  IconGitHub,
  IconNextChat,
  IconAthenaLogo,
  IconSeparator,
  IconVercel,
  IconArrowRight
} from '@/components/ui/icons'

import { cn } from '@/lib/utils'

import Link from 'next/link'


const exampleMessages = [
  {
    heading: 'Ask inventory questions',
    message: `What product has the best margins?`
  },
  {
    heading: 'Ask for sales metrics',
    message: 'Which salesperson has grossed the most revenue?\n'
  },
  {
    heading: 'Calculate revenue',
    message: `What is my lifetime revenue?\n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {

  const handleExampleMessageClick = (message : any) => {
    setInput(message);
  };

  return (
    <div className="flex justify-center mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="flex justify-center mb-2 text-lg font-semibold">
          Welcome to Athena!
        </h1>
        <p className="mb-2 leading-normal text-center text-muted-foreground">
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
          <span className="items-center justify-end hidden ml-2 md:flex ">Connect Data Sources</span>
        </Link>
        </div>
        <p className="mb-2 leading-normal text-center text-muted-foreground mt-8">Here&apos;s some example questions to get started:</p>
        <div className="flex justify-center gap-2 mb-8 mt-4 bg-background">
          {exampleMessages.map((ex, index) => (
            <Button key={index} onClick={() => handleExampleMessageClick(ex.message)} className="btn-outline">
              {ex.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
