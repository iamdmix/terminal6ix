export type UserRole = "participant" | "organiser"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Event {
  id: string
  name: string
  description: string | null
  start_time: string
  end_time: string
  flag_format: string | null
  created_by: string
  created_at: string
  updated_at: string
  challenge_count: number
  total_points: number
  participant_count: number
  is_registered: boolean
  is_ongoing: boolean
}

export type ChallengeCategory = "web" | "crypto" | "reverse" | "forensics" | "pwn" | "osint" | "misc"
export type ChallengeDifficulty = "easy" | "medium" | "hard" | "insane"

export interface Challenge {
  id: string
  event_id: string
  title: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  flag_hint: string | null
  attachment_url: string | null
  connection_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChallengeAdmin extends Challenge {
  flag: string
}

export interface Submission {
  id: string
  challenge_id: string
  user_id: string
  submitted_flag: string
  is_correct: boolean
  points_awarded: number
  submitted_at: string
}

export interface Solve {
  id: string
  challenge_id: string
  points_awarded: number
  submitted_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  user_name: string
  score: number
  solved_count: number
  last_solve_at: string | null
}

export interface PlatformStats {
  users: number
  events: number
  challenges: number
  flags_captured: number
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
