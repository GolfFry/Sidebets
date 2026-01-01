export default function MatchPage({ params }: { params: { id: string } }) {
  return <div className="p-4"><h1 className="text-xl font-bold">Match: {params.id}</h1></div>
}
