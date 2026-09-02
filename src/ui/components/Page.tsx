




export default function Page({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col w-dvw min-h-dvh ${className || ''}`}>
      {children}
    </div>
  )
}