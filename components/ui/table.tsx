import { ReactNode } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="border border-[#E5E7EB] rounded-[4px] overflow-hidden">
      <table className="w-full">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-[#FAFBFC] border-b border-[#E5E7EB]">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-[#E5E7EB] last:border-b-0">{children}</tr>
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="px-[1.67vw] py-[1.11vw] text-left label uppercase text-[#6B7280]">
      {children}
    </th>
  )
}

export function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-[1.67vw] py-[1.39vw] body">{children}</td>
}
