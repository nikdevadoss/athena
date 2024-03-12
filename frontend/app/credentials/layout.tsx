// import { SidebarDesktop } from '@/components/sidebar-desktop'
import { Sidebar } from '@/components/sidebar'
import CredentialsPage from '../credentials/page'


export default async function CredentialsLayout( ) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      {/* <ChatHistory userId={session.user.id} /> */}
      </Sidebar>
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
        {/* {children} */}
        <CredentialsPage></CredentialsPage>
      </div>
    </div>
  )
}