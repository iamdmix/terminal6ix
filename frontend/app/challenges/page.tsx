import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"

const challenges = [
  {
    title: "SQL Injection",
    category: "Web",
    difficulty: "Medium",
    points: 500,
    solved: 234,
  },
  {
    title: "RSA Crypto",
    category: "Crypto",
    difficulty: "Hard",
    points: 1000,
    solved: 45,
  },
  {
    title: "Memory Forensics",
    category: "Forensics",
    difficulty: "Easy",
    points: 200,
    solved: 567,
  },
]

export default function ChallengesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">CTF Challenges</h1>
          <p className="text-xl text-muted-foreground">Test your skills across multiple domains.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge.title} className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline">{challenge.category}</Badge>
                <Badge variant="secondary">{challenge.difficulty}</Badge>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-4">{challenge.title}</h3>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">{challenge.points}</span> points • {challenge.solved}{" "}
                  solved
                </div>
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                  Solve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
