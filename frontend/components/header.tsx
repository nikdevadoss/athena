import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconExternalLink,
  IconGitHub,
  IconNextChat,
  IconAthenaLogo,
  IconAthenaNameLogo,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'

async function UserSidebarToggle() {
  const session = await auth()
  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}

    </>
  )
}

async  function UserDropdown() {
  const session = await auth()
  return (
  <div className="flex items-center">
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/sign-in?callbackUrl=/">Login</Link>
          </Button>
        )}
  </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <UserSidebarToggle />
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <IconSeparator className="size-6 text-muted-foreground/50" />
          <Link 
          href="/credentials" 
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconExternalLink></IconExternalLink>
          <span className="hidden ml-2 md:flex">Connect Data Sources</span>
        </Link>
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Link 
          href="/" 
        >
          <IconAthenaNameLogo></IconAthenaNameLogo>
        </Link>
      </div>  
      <div className="flex justify-end space-x-2">
        <UserDropdown></UserDropdown>
      </div>
      
    </header>
  )
}
