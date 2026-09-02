



export default function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col p-4 m-4 rounded-lg border shadow-lg ${className || ''}`}>
      {children}
    </div>
  )
}