import { Sidebar } from '@/components/sidebar'
import CredentialsPage from '../credentials/page'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

export default function CredentialsLayout() {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
        {/* Sidebar content here */}
      </Sidebar>
      <div className="group w-full overflow-auto animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        <div className="flex flex-col space-y-4 p-4">
          {/* Back button */}
          {/* Credentials page content */}
          {/* <Link href="/" passHref>
            <Button
              as="a"
              className={cn(buttonVariants({ variant: 'outline' }), "mb-4 self-start")}
            >
              <span className="hidden ml-2 md:flex">Back to Chatbot</span>
            </Button>
          </Link> */}
          <CredentialsPage />
        </div>
      </div>
    </div>
  );
}
